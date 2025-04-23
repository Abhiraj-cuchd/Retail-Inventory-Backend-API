import type { IInvoice, InvoiceStatus } from "../models/invoice.model"

export interface IInvoiceRepository {
  findById(id: string): Promise<IInvoice | null>
  findByInvoiceNumber(invoiceNumber: string): Promise<IInvoice | null>
  findByCustomerId(customerId: string): Promise<IInvoice[]>
  findByStatus(status: InvoiceStatus): Promise<IInvoice[]>
  findAll(filter?: Partial<IInvoice>): Promise<IInvoice[]>
  create(invoice: IInvoice): Promise<IInvoice>
  update(id: string, invoice: Partial<IInvoice>): Promise<IInvoice | null>
  updateStatus(id: string, status: InvoiceStatus): Promise<IInvoice | null>
  delete(id: string): Promise<boolean>
  getRecentInvoices(limit: number): Promise<IInvoice[]>
}
