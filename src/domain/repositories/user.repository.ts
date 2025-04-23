import type { IUser } from "../models/user.model"

export interface IUserRepository {
  findById(id: string): Promise<IUser | null>
  findByEmail(email: string): Promise<IUser | null>
  findAll(filter?: Partial<IUser>): Promise<IUser[]>
  create(user: IUser): Promise<IUser>
  update(id: string, user: Partial<IUser>): Promise<IUser | null>
  delete(id: string): Promise<boolean>
}
