export interface IPromotion {
  id?: string
  name: string
  description: string
  startDate: Date
  endDate: Date
  discountId?: string
  bannerImage?: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

export class Promotion implements IPromotion {
  id?: string
  name: string
  description: string
  startDate: Date
  endDate: Date
  discountId?: string
  bannerImage?: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date

  constructor(data: IPromotion) {
    this.id = data.id
    this.name = data.name
    this.description = data.description
    this.startDate = data.startDate
    this.endDate = data.endDate
    this.discountId = data.discountId
    this.bannerImage = data.bannerImage
    this.isActive = data.isActive
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  isActive(currentDate: Date = new Date()): boolean {
    return this.isActive && currentDate >= this.startDate && currentDate <= this.endDate
  }
}
