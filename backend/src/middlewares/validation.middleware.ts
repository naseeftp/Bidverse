import { Request, Response, NextFunction } from "express";

export const validator = <T>(validatorFn: (data: T) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      validatorFn(req.body as T)
    } catch (error) {
      next(error)
    }
  }
}