import { Request, Response, NextFunction } from "express";

export interface ISlotController {
    bookSlot(req: Request, res: Response, next: NextFunction): Promise<void>
    listAllSlotForUser(req: Request, res: Response, next: NextFunction): Promise<void>
}