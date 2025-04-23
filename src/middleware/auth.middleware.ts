import type {NextFunction, Request, Response} from "express"
import {AuthService} from "../application/services/auth.service"
import {UserRepository} from "../infrastructure/repositories/user.repository"
import {ApiError} from "../utils/apiError"
import type {UserRole} from "../domain/models/user.model"

const userRepository = new UserRepository()
const authService = new AuthService(userRepository)

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role: UserRole
  }
}

export const authenticate = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Authentication required")
    }

    const token = authHeader.split(" ")[1]
    req.user = authService.verifyToken(token)
    next()
  } catch (error) {
    next(error)
  }
}

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized("Authentication required"))
    }

    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden("You do not have permission to access this resource"))
    }

    next()
  }
}
