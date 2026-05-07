import { Request, Response, NextFunction } from "express";

export interface IAddressController {
    createAddress(req: Request, res: Response, next: NextFunction): Promise<void>
}