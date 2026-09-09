import { Request, Response, NextFunction } from "express"

export interface IChekoutController {
    getCheckOutDetails(req: Request, res: Response, next: NextFunction): Promise<void>
}