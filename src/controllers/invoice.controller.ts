import { Body, Controller, Delete, Get, Path, Post, Put, Route, Security, Tags, Response } from "tsoa"
import { InvoiceRepository } from "../infrastructure/repositories/invoice.repository"
import { type IInvoice, Invoice, InvoiceStatus, type IInvoiceItem } from "../domain/models/invoice.model"
import { StockRepository } from "../infrastructure/repositories/stock.repository"
import { UserRepository } from "../infrastructure/repositories/user.repository"
import { EmailService } from "../application/services/email.service"
import { ApiError } from "../utils/apiError"
import { generatePdf } from "../utils/pdfGenerator"

interface CreateInvoiceRequest {
  customerId: string
  items: {
    productId: string
    quantity: number
    price: number
    discount: number
  }[]
  tax?: number
  discount?: number
  notes?: string
  paymentMethod?: string
}

interface UpdateInvoiceRequest {
  status?: InvoiceStatus
  paymentMethod?: string
  notes?: string
}

@Route("invoices")
@Tags("Invoices")
export class InvoiceController extends Controller {
  private invoiceRepository: InvoiceRepository
  private stockRepository: StockRepository
  private userRepository: UserRepository
  private emailService: EmailService

  constructor() {
    super()
    this.invoiceRepository = new InvoiceRepository()
    this.stockRepository = new StockRepository()
    this.userRepository = new UserRepository()
    this.emailService = new EmailService()
  }

  /**
   * Get all invoices
   */
  @Get()
  @Security("jwt", ["admin", "storemanager"])
  @Response(401, "Unauthorized")
  public async getInvoices(): Promise<IInvoice[]> {
    return this.invoiceRepository.findAll()
  }

  /**
   * Get invoice by ID
   */
  @Get('{id}')
  @Security('jwt', ['admin', 'storemanager'])
  @Response(401, 'Unauthorized')
  @Response(404, 'Invoice not found')
  public async getInvoiceById(@Path() id: string): Promise<IInvoice> {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      this.setStatus(404);
      throw new Error('Invoice not found');
    }
    return invoice;
  }

  /**
   * Get invoices by customer ID
   */
  @Get('customer/{customerId}')
  @Security('jwt', ['admin', 'storemanager'])
  @Response(401, 'Unauthorized')
  public async getInvoicesByCustomerId(@Path() customerId: string): Promise<IInvoice[]> {
    return this.invoiceRepository.findByCustomerId(customerId);
  }

  /**
   * Create invoice
   */
  @Post()
  @Security('jwt', ['admin', 'storemanager'])
  @Response(401, 'Unauthorized')
  @Response(400, 'Bad Request')
  public async createInvoice(@Body() requestBody: CreateInvoiceRequest): Promise<IInvoice> {
    // Validate customer exists
    const customer = await this.userRepository.findById(requestBody.customerId);
    if (!customer) {
      throw ApiError.badRequest('Customer not found');
    }

    // Calculate totals
    const items: IInvoiceItem[] = [];
    let subtotal = 0;

    for (const item of requestBody.items) {
      const total = (item.price - item.discount) * item.quantity;
      items.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        total,
      });
      subtotal += total;

      // Update stock
      const stock = await this.stockRepository.findByProductId(item.productId);
      if (!stock || stock.length === 0) {
        throw ApiError.badRequest(`No stock found for product ${item.productId}`);
      }

      // Check if there's enough stock
      const totalStock = stock.reduce((sum, s) => sum + s.quantity, 0);
      if (totalStock < item.quantity) {
        throw ApiError.badRequest(`Not enough stock for product ${item.productId}`);
      }

      // Deduct from stock (from the first location that has enough)
      let remainingQuantity = item.quantity;
      for (const s of stock) {
        if (remainingQuantity <= 0) break;

        const deduction = Math.min(s.quantity, remainingQuantity);
        await this.stockRepository.updateQuantity(s.id!, -deduction);
        remainingQuantity -= deduction;
      }
    }

    const tax = requestBody.tax || 0;
    const discount = requestBody.discount || 0;
    const total = subtotal + tax - discount;

    // Generate invoice number
    const date = new Date();
    const invoiceNumber = `INV-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    const invoice = new Invoice({
      invoiceNumber,
      customerId: requestBody.customerId,
      items,
      subtotal,
      tax,
      discount,
      total,
      status: InvoiceStatus.PENDING,
      paymentMethod: requestBody.paymentMethod,
      notes: requestBody.notes,
    });

    const createdInvoice = await this.invoiceRepository.create(invoice);

    return createdInvoice;
  }

  /**
   * Update invoice
   */
  @Put("{id}")
  @Security("jwt", ["admin", "storemanager"])
  @Response(401, "Unauthorized")
  @Response(404, "Invoice not found")
  public async updateInvoice(@Path() id: string, @Body() requestBody: UpdateInvoiceRequest): Promise<IInvoice> {
    const updatedInvoice = await this.invoiceRepository.update(id, requestBody)
    if (!updatedInvoice) {
      this.setStatus(404)
      throw new Error("Invoice not found")
    }
    return updatedInvoice
  }

  /**
   * Update invoice status
   */
  @Put("{id}/status/{status}")
  @Security("jwt", ["admin", "storemanager"])
  @Response(401, "Unauthorized")
  @Response(404, "Invoice not found")
  public async updateInvoiceStatus(@Path() id: string, @Path() status: InvoiceStatus): Promise<IInvoice> {
    const updatedInvoice = await this.invoiceRepository.updateStatus(id, status)
    if (!updatedInvoice) {
      this.setStatus(404)
      throw new Error("Invoice not found")
    }
    return updatedInvoice
  }

  /**
   * Delete invoice
   */
  @Delete('{id}')
  @Security('jwt', ['admin'])
  @Response(401, 'Unauthorized')
  @Response(403, 'Forbidden')
  @Response(404, 'Invoice not found')
  public async deleteInvoice(@Path() id: string): Promise<void> {
    const deleted = await this.invoiceRepository.delete(id);
    if (!deleted) {
      this.setStatus(404);
      throw new Error('Invoice not found');
    }
  }

  /**
   * Send invoice by email
   */
  @Post('{id}/send')
  @Security('jwt', ['admin', 'storemanager'])
  @Response(401, 'Unauthorized')
  @Response(404, 'Invoice not found')
  public async sendInvoice(@Path() id: string): Promise<{ success: boolean; message: string }> {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      this.setStatus(404);
      throw new Error('Invoice not found');
    }

    const customer = await this.userRepository.findById(invoice.customerId);
    if (!customer) {
      throw ApiError.badRequest('Customer not found');
    }

    // Generate PDF
    const pdfBuffer = await generatePdf(invoice);

    // Send email
    const success = await this.emailService.sendInvoiceEmail(
      customer.email,
      customer.fullName,
      invoice.invoiceNumber,
      pdfBuffer
    );

    return {
      success,
      message: success ? 'Invoice sent successfully' : 'Failed to send invoice',
    };
  }

  /**
   * Get recent invoices
   */
  @Get('recent/{limit}')
  @Security('jwt', ['admin', 'storemanager'])
  @Response(401, 'Unauthorized')
  public async getRecentInvoices(@Path() limit: number): Promise<IInvoice[]> {
    return this.invoiceRepository.getRecentInvoices(limit);
  }
}
