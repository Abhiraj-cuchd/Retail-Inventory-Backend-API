import { Body, Controller, Delete, Get, Path, Put, Route, Security, Tags, Response } from "tsoa"
import { UserRepository } from "../infrastructure/repositories/user.repository"
import type { IUser } from "../domain/models/user.model"

interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  isActive?: boolean
}

@Route("users")
@Tags("Users")
export class UserController extends Controller {
  private userRepository: UserRepository

  constructor() {
    super()
    this.userRepository = new UserRepository()
  }

  /**
   * Get all users
   */
  @Get()
  @Security("jwt", ["admin"])
  @Response(401, "Unauthorized")
  @Response(403, "Forbidden")
  public async getUsers(): Promise<IUser[]> {
    return this.userRepository.findAll()
  }

  /**
   * Get user by ID
   */
  @Get('{id}')
  @Security('jwt', ['admin', 'storemanager'])
  @Response<401>('Unauthorized')
  @Response<403>('Forbidden')
  @Response<404>('User not found')
  public async getUserById(@Path() id: string): Promise<IUser> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      this.setStatus(404);
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * Update user
   */
  @Put("{id}")
  @Security("jwt", ["admin"])
  @Response(401, "Unauthorized")
  @Response(403, "Forbidden")
  @Response(404, "User not found")
  public async updateUser(@Path() id: string, @Body() requestBody: UpdateUserRequest): Promise<IUser> {
    const updatedUser = await this.userRepository.update(id, requestBody)
    if (!updatedUser) {
      this.setStatus(404)
      throw new Error("User not found")
    }
    return updatedUser
  }

  /**
   * Delete user
   */
  @Delete('{id}')
  @Security('jwt', ['admin'])
  @Response(401, 'Unauthorized')
  @Response(403, 'Forbidden')
  @Response(404, 'User not found')
  public async deleteUser(@Path() id: string): Promise<void> {
    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      this.setStatus(404);
      throw new Error('User not found');
    }
  }
}
