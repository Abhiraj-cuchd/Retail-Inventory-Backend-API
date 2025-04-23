export enum DiscountType {
  PERCENTAGE = "percentage",
  FIXED = "fixed",
}

export interface IDiscount {
  id?: string
  name: string
  description?: string
  type: DiscountType
  value: number
  code?: string
  startDate: Date
  endDate: Date
  isActive: boolean
  minimumPurchase?: number
  maximumDiscount?: number
  productIds?: string[]
  categoryIds?: string[]
  createdAt?: Date
  updatedAt?: Date
}

export class Discount implements IDiscount {
  id?: string
  name: string
  description?: string
  type: DiscountType
  value: number
  code?: string
  startDate: Date
  endDate: Date
  isActive: boolean
  minimumPurchase?: number
  maximumDiscount?: number
  productIds?: string[]
  categoryIds?: string[]
  createdAt?: Date
  updatedAt?: Date

  constructor(data: IDiscount) {
    this.id = data.id
    this.name = data.name
    this.description = data.description
    this.type = data.type
    this.value = data.value
    this.code = data.code
    this.startDate = data.startDate
    this.endDate = data.endDate
    this.isActive = data.isActive
    this.minimumPurchase = data.minimumPurchase
    this.maximumDiscount = data.maximumDiscount
    this.productIds = data.productIds
    this.categoryIds = data.categoryIds
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  isValid(currentDate: Date = new Date()): boolean {
    return this.isActive && currentDate >= this.startDate && currentDate <= this.endDate
  }

  calculateDiscount(price: number): number {
    if (this.type === DiscountType.PERCENTAGE) {
      const discount = price * (this.value / 100)
      return this.maximumDiscount ? Math.min(discount, this.maximumDiscount) : discount
    } else {
      return Math.min(this.value, price)
    }
  }
}
