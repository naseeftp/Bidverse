import { Request, Response, NextFunction } from "express";
import { ILiveAcutionStateService } from "../../services/interface/ILiveAuctionSate.service";
import { IliveController } from "../interfaces/ILiveState.controller";
import { SuccessResponse } from "../../utils/response.utility";
import { HttpStatus, MESSAGES } from "../../constants/constants";

export class LiveController implements IliveController {
    constructor(
        private _liveService: ILiveAcutionStateService
    ) { }
    async findLiveState(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const auctionId = req.params.id.toString()
            const result = await this._liveService.findLiveState(auctionId);
            SuccessResponse(res, MESSAGES.ACTION_SUCCESS, result, HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
    async joinRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId=req.user.id;
            const auctionId=req.params.id as string
            const result=await this._liveService.joinRoom(userId,auctionId);
            SuccessResponse(res,MESSAGES.ACTION_SUCCESS,result,HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
}