import { Request, Response, NextFunction } from "express";


export interface IPublicAuctionController {
    listAllPublicAuctionHouses(req: Request, res: Response, next: NextFunction): Promise<void>
    getPublicAuctions(req: Request, res: Response, next: NextFunction): Promise<void>
    getAuctionDetails(req: Request, res: Response, next: NextFunction): Promise<void>
    getHouseDetailsWithAuctions(req: Request, res: Response, next: NextFunction): Promise<void>
}