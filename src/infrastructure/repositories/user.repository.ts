import { type IUser, User } from "../../domain/models/user.model"
import type { IUserRepository } from "../../domain/repositories/user.repository"
import { UserModel } from "../database/schemas/user.schema"
import { ApiError } from "../../utils/apiError"

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findById(id)
      return user ? new User(user.toJSON()) : null
    } catch (error) {
      throw new ApiError(500, `Error finding user by ID: ${error}`)
    }
  }

  async findByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findOne({ email })
      return user ? new User(user.toJSON()) : null
    } catch (error) {
      throw new ApiError(500, `Error finding user by email: ${error}`)
    }
  }

  async findAll(filter: Partial<IUser> = {}): Promise<IUser[]> {
    try {
      const users = await UserModel.find(filter)
      return users.map((user) => new User(user.toJSON()))
    } catch (error) {
      throw new ApiError(500, `Error finding users: ${error}`)
    }
  }

  async create(userData: IUser): Promise<IUser> {
    try {
      const user = new UserModel(userData)
      await user.save()
      return new User(user.toJSON())
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ApiError(409, "Email already exists")
      }
      throw new ApiError(500, `Error creating user: ${error}`)
    }
  }

  async update(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    try {
      const user = await UserModel.findByIdAndUpdate(id, { $set: userData }, { new: true, runValidators: true })
      return user ? new User(user.toJSON()) : null
    } catch (error) {
      throw new ApiError(500, `Error updating user: ${error}`)
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await UserModel.findByIdAndDelete(id)
      return !!result
    } catch (error) {
      throw new ApiError(500, `Error deleting user: ${error}`)
    }
  }
}
