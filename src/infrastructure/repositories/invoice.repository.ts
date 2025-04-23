import { type IInvoice, Invoice, type InvoiceStatus } from "../../domain/models/invoice.model"
import type { IInvoiceRepository } from "../../domain/repositories/invoice.repository"
import { InvoiceModel } from "../database/schemas/invoice.schema"
import { ApiError } from "../../utils/apiError"

export class InvoiceRepository implements IInvoiceRepository {
  async findById(id: string): Promise<IInvoice | null> {
    try {
      const invoice = await InvoiceModel.findById(id)
      return invoice ? new Invoice(invoice.toJSON()) : null
    } catch (error) {
      throw new ApiError(500, `Error finding invoice by ID: ${error}`)
    }
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<IInvoice | null> {
    try {
      const invoice = await InvoiceModel.findOne({ invoiceNumber })
      return invoice ? new Invoice(invoice.toJSON()) : null
    } catch (error) {
      throw new ApiError(500, `Error finding invoice by number: ${error}`)
    }
  }

  async findByCustomerId(customerId: string): Promise<IInvoice[]> {
    try {
      const invoices = await InvoiceModel.find({ customerId })
      return invoices.map((invoice) => new Invoice(invoice.toJSON()))
    } catch (error) {
      throw new ApiError(500, `Error finding invoices by customer ID: ${error}`)
    }
  }

  async findByStatus(status: InvoiceStatus): Promise<IInvoice[]> {
    try {
      const invoices = await InvoiceModel.find({ status })
      return invoices.map((invoice) => new Invoice(invoice.toJSON()))
    } catch (error) {
      throw new ApiError(500, `Error finding invoices by status: ${error}`)
    }
  }

  async findAll(filter: Partial<IInvoice> = {}): Promise<IInvoice[]> {
    try {
      const invoices = await InvoiceModel.find(filter)
      return invoices.map((invoice) => new Invoice(invoice.toJSON()))
    } catch (error) {
      throw new ApiError(500, `Error finding invoices: ${error}`)
    }
  }

  async create(invoiceData: IInvoice): Promise<IInvoice> {
    try {
      const invoice = new InvoiceModel(invoiceData)
      await invoice.save()
      return new Invoice(invoice.toJSON())
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ApiError(409, "Invoice with this number already exists")
      }
      throw new ApiError(500, `Error creating invoice: ${error}`)
    }
  }

  async update(id: string, invoiceData: Partial<IInvoice>): Promise<IInvoice | null> {
    try {
      const invoice = await InvoiceModel.findByIdAndUpdate(
        id,
        { $set: invoiceData },
        { new: true, runValidators: true },
      )
      return invoice ? new Invoice(invoice.toJSON()) : null
    } catch (error) {
      throw new ApiError(500, `Error updating invoice: ${error}`)
    }
  }

  async updateStatus(id: string, status: InvoiceStatus): Promise<IInvoice | null> {
    try {
      const invoice = await InvoiceModel.findByIdAndUpdate(id, { $set: { status } }, { new: true, runValidators: true })
      return invoice ? new Invoice(invoice.toJSON()) : null
    } catch (error) {
      throw new ApiError(500, `Error updating invoice status: ${error}`)
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await InvoiceModel.findByIdAndDelete(id)
      return !!result
    } catch (error) {
      throw new ApiError(500, `Error deleting invoice: ${error}`)
    }
  }

  async getRecentInvoices(limit: number): Promise<IInvoice[]> {
    try {
      const invoices = await InvoiceModel.find().sort({ createdAt: -1 }).limit(limit)
      return invoices.map((invoice) => new Invoice(invoice.toJSON()))
    } catch (error) {
      throw new ApiError(500, `Error getting recent invoices: ${error}`)
    }
  }
}
