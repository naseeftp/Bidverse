import { Request, Response, NextFunction } from "express";
import { AuctionHouseVerificationDTO } from "../../dtos/auctionHouse.dto/auctionHouse.dto";

export interface IAuctionHouseController {
    submitVerification(
        req: Request<Record<string, never>, unknown, AuctionHouseVerificationDTO>,
        res: Response,
        next: NextFunction
    ): Promise<void>

    getProfile(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void>
    getUploadSignature(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void>
}