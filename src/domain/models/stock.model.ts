export interface IStock {
  id?: string
  productId: string
  quantity: number
  locationId: string
  batchNumber?: string
  expiryDate?: Date
  createdAt?: Date
  updatedAt?: Date
}

export class Stock implements IStock {
  id?: string
  productId: string
  quantity: number
  locationId: string
  batchNumber?: string
  expiryDate?: Date
  createdAt?: Date
  updatedAt?: Date

  constructor(data: IStock) {
    this.id = data.id
    this.productId = data.productId
    this.quantity = data.quantity
    this.locationId = data.locationId
    this.batchNumber = data.batchNumber
    this.expiryDate = data.expiryDate
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  isLowStock(threshold: number): boolean {
    return this.quantity < threshold
  }

  isOutOfStock(): boolean {
    return this.quantity <= 0
  }
}
