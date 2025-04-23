export enum InvoiceStatus {
  DRAFT = "draft",
  PENDING = "pending",
  PAID = "paid",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

export interface IInvoiceItem {
  productId: string
  quantity: number
  price: number
  discount: number
  total: number
}

export interface IInvoice {
  id?: string
  invoiceNumber: string
  customerId: string
  items: IInvoiceItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  status: InvoiceStatus
  paymentMethod?: string
  notes?: string
  createdAt?: Date
  updatedAt?: Date
}

export class InvoiceItem implements IInvoiceItem {
  productId: string
  quantity: number
  price: number
  discount: number
  total: number

  constructor(data: IInvoiceItem) {
    this.productId = data.productId
    this.quantity = data.quantity
    this.price = data.price
    this.discount = data.discount
    this.total = data.total
  }
}

export class Invoice implements IInvoice {
  id?: string
  invoiceNumber: string
  customerId: string
  items: IInvoiceItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  status: InvoiceStatus
  paymentMethod?: string
  notes?: string
  createdAt?: Date
  updatedAt?: Date

  constructor(data: IInvoice) {
    this.id = data.id
    this.invoiceNumber = data.invoiceNumber
    this.customerId = data.customerId
    this.items = data.items.map((item) => new InvoiceItem(item))
    this.subtotal = data.subtotal
    this.tax = data.tax
    this.discount = data.discount
    this.total = data.total
    this.status = data.status
    this.paymentMethod = data.paymentMethod
    this.notes = data.notes
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  calculateTotal(): number {
    this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0)
    this.total = this.subtotal + this.tax - this.discount
    return this.total
  }
}
