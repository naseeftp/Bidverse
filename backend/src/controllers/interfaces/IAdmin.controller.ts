import { Request, Response, NextFunction } from "express";
import { UpdateHouseStatusDTO, UpdateUserStatusDTO } from "../../dtos/admin.dto/updatestatus.dto";
import { ParamsDictionary } from 'express-serve-static-core'

export interface IAdminController {
    getAuctionHouses(req: Request, res: Response, next: NextFunction): Promise<void>
    getAuctionHouseById(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateAuctionHouseStatus(
        req: Request<ParamsDictionary,unknown, UpdateHouseStatusDTO>,
        res: Response,
        next: NextFunction
    ): Promise<void>
    getAllUsers(req:Request,res:Response,next:NextFunction):Promise<void>
    getUserById(req:Request,res:Response,next:NextFunction):Promise<void>
    updateUserStatus(
        req:Request<ParamsDictionary,unknown,UpdateUserStatusDTO>,
        res:Response,
        next:NextFunction
    ):Promise<void>
}