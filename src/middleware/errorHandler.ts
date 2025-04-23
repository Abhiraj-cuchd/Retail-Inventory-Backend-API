import type { Request, Response, NextFunction } from "express"
import { ValidateError } from "tsoa"
import { logger } from "../utils/logger"
import { ApiError } from "../utils/apiError"

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): Response | void {
  if (err instanceof ValidateError) {
    logger.warn(`Validation error for ${req.path}:`, err.fields)
    return res.status(422).json({
      message: "Validation Failed",
      details: err.fields,
    })
  }

  if (err instanceof ApiError) {
    logger.error(`API error for ${req.path}:`, { message: err.message, code: err.statusCode })
    return res.status(err.statusCode).json({
      message: err.message,
    })
  }

  if (err instanceof Error) {
    logger.error(`Internal error for ${req.path}:`, err)
    return res.status(500).json({
      message: "Internal Server Error",
    })
  }

  next()
}
