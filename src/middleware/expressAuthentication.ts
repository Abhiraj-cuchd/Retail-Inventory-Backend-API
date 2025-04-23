import jwt from "jsonwebtoken"
import { UserRepository } from "../infrastructure/repositories/user.repository"
import type { UserRole } from "../domain/models/user.model"
import config from "../config"
import {logger} from "../utils/logger";

interface JwtPayload {
    id: string
    email: string
    role: UserRole
}

/**
 * Express authentication middleware for TSOA
 * This function is called by the TSOA middleware to authenticate requests
 *
 * @param request Express request
 * @param securityName Security scheme name (e.g., 'jwt')
 * @param scopes Required scopes (roles in our case)
 * @returns User data if authentication is successful
 */
export async function expressAuthentication(request: any, securityName: string, scopes?: string[]): Promise<any> {
    if (securityName !== "jwt") {
        throw new Error("Invalid security scheme")
    }

    const authHeader = request.headers.authorization
    console.log("authHeader", authHeader)
    if (!authHeader) {
        throw new Error("Authorization header is missing or invalid")
    }

    try {
        // Verify the token
        const decodedToken = jwt.verify(authHeader, config.jwt.secret) as JwtPayload

        // If scopes (roles) are required, check if the user has the required role
        if (scopes && scopes.length > 0) {
            if (!scopes.includes(decodedToken.role)) {
                throw new Error("Insufficient permissions")
            }
        }

        // Optionally, you can fetch the user from the database to ensure they still exist and are active
        const userRepository = new UserRepository()
        const user = await userRepository.findById(decodedToken.id)

        if (!user) {
            throw new Error("User not found")
        }

        if (!user.isActive) {
            throw new Error("User account is inactive")
        }

        // Return the decoded token as the user data
        return decodedToken
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error("Invalid token")
        } else if (error instanceof jwt.TokenExpiredError) {
            throw new Error("Token has expired")
        } else {
            throw error
        }
    }
}
