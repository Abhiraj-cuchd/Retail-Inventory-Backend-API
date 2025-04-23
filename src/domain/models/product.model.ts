export interface IProduct {
  id?: string
  name: string
  description: string
  sku: string
  barcode?: string
  price: number
  costPrice: number
  categoryId: string
  imageUrl?: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

export class Product implements IProduct {
  id?: string
  name: string
  description: string
  sku: string
  barcode?: string
  price: number
  costPrice: number
  categoryId: string
  imageUrl?: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date

  constructor(data: IProduct) {
    this.id = data.id
    this.name = data.name
    this.description = data.description
    this.sku = data.sku
    this.barcode = data.barcode
    this.price = data.price
    this.costPrice = data.costPrice
    this.categoryId = data.categoryId
    this.imageUrl = data.imageUrl
    this.isActive = data.isActive
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  get profit(): number {
    return this.price - this.costPrice
  }

  get profitMargin(): number {
    return (this.profit / this.price) * 100
  }
}
