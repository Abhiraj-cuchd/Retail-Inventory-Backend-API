export interface ICategory {
  id?: string
  name: string
  description?: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

export class Category implements ICategory {
  id?: string
  name: string
  description?: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date

  constructor(data: ICategory) {
    this.id = data.id
    this.name = data.name
    this.description = data.description
    this.isActive = data.isActive
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }
}
