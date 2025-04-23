export class ApiError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }

  static badRequest(message: string): ApiError {
    return new ApiError(400, message)
  }

  static unauthorized(message = "Unauthorized"): ApiError {
    return new ApiError(401, message)
  }

  static forbidden(message = "Forbidden"): ApiError {
    return new ApiError(403, message)
  }

  static notFound(message = "Resource not found"): ApiError {
    return new ApiError(404, message)
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message)
  }

  static internal(message = "Internal server error"): ApiError {
    return new ApiError(500, message)
  }
}
