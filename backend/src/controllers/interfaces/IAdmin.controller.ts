import { Request, Response, NextFunction } from "express";
import { UpdateHouseStatusDTO } from "../../dtos/admin.dto/updatestatus.dto";
import {ParamsDictionary} from 'express-serve-static-core'

export interface IAdminController {
    getAuctionHouses(req: Request, res: Response, next: NextFunction): Promise<void>
    getAuctionHouseById(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateAuctionHouseStatus(
     req:Request<ParamsDictionary,any,UpdateHouseStatusDTO>,
     res:Response,
     next:NextFunction
    ):Promise<void>
}