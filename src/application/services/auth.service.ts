import jwt from "jsonwebtoken"
import type { IUser, UserRole } from "../../domain/models/user.model"
import type { IUserRepository } from "../../domain/repositories/user.repository"
import { ApiError } from "../../utils/apiError"
import config from "../../config"

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: IUser
  token: string
}

export class AuthService {
  constructor(private userRepository: IUserRepository) {}

  async register(userData: IUser): Promise<IUser> {
    const existingUser = await this.userRepository.findByEmail(userData.email)
    if (existingUser) {
      throw ApiError.conflict("Email already exists")
    }

    return this.userRepository.create(userData)
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials

    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      throw ApiError.unauthorized("Invalid email or password")
    }

    // We need to get the document to use the comparePassword method
    const userModel = await (await import("../../infrastructure/database/schemas/user.schema")).UserModel.findOne({
      email,
    })
    if (!userModel) {
      throw ApiError.unauthorized("Invalid email or password")
    }

    const isPasswordValid = await userModel.comparePassword(password)
    if (!isPasswordValid) {
      throw ApiError.unauthorized("Invalid email or password")
    }

    if (!user.isActive) {
      throw ApiError.unauthorized("Your account is inactive")
    }

    const token = this.generateToken(user)

    return {
      user,
      token,
    }
  }

  generateToken(user: IUser): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiresIn,
      },
    )
  }

  verifyToken(token: string): { id: string; email: string; role: UserRole } {
    try {
      return jwt.verify(token, config.jwt.secret) as { id: string; email: string; role: UserRole }
    } catch (error) {
      throw ApiError.unauthorized("Invalid or expired token")
    }
  }
}
