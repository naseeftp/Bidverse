import { Request, Response, NextFunction } from "express";

export interface IAuctionItemMangementController {
    createAuctionItem(req: Request, res: Response, next: NextFunction): Promise<void>
    getAllAuctionByAdmin(req: Request, res: Response, next: NextFunction): Promise<void>
    getTenantAuctions(req: Request, res: Response, next: NextFunction): Promise<void>
    getAuctionDetails(req: Request, res: Response, next: NextFunction): Promise<void>
    updateAuctionStatus(req: Request, res: Response, next: NextFunction): Promise<void>
    editAuction(req: Request, res: Response, next: NextFunction): Promise<void>
    cancellAuction(req: Request, res: Response, next: NextFunction): Promise<void>

}