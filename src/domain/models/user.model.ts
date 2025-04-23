export enum UserRole {
  ADMIN = "admin",
  STORE_MANAGER = "storemanager",
  CUSTOMER = "customer",
}

export interface IUser {
  id?: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

export class User implements IUser {
  id?: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date

  constructor(data: IUser) {
    this.id = data.id
    this.email = data.email
    this.password = data.password
    this.firstName = data.firstName
    this.lastName = data.lastName
    this.role = data.role
    this.isActive = data.isActive
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`
  }
}
