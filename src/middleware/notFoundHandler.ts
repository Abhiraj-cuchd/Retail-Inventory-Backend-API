import type { Request, Response } from "express"

export function notFoundHandler(_req: Request, res: Response) {
  return res.status(404).json({
    message: "Resource not found",
  })
}
