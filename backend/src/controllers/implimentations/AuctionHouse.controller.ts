import { Request, Response, NextFunction } from "express";
import { IAuctionHouseController } from "../interfaces/IAuctionHouse.controller";
import { IAuctionService } from "../../services/interface/IAuctionHouse.service";
import { ILoggerService } from "../../services/interface/ILogger.service";
import { HttpStatus, MESSAGES } from "../../constants/constants";
import { SuccessResponse } from "../../utils/response.utility";
import { AuctionHouseVerificationDTO } from "../../dtos/auctionHouse.dto/auctionHouse.dto";


export class AuctionHouseController implements IAuctionHouseController {
    constructor(
        private _auctionHouseService: IAuctionService,
        private _logger: ILoggerService
    ) { }
    async submitVerification(req: Request<Record<string, never>, unknown, AuctionHouseVerificationDTO>, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user.id;
            this._logger.info('Verification submission started', { userId, email: req.user.email })
            const result = await this._auctionHouseService.submitVerificationRequest(userId, req.body)
            this._logger.info("Verofication submission sucessfull", { userId, recordId: result.id })
            SuccessResponse(res, MESSAGES.VERIFICATION_SUBMITTED, result, HttpStatus.CREATED)
        } catch (error: unknown) {
            this._logger.error('Verification submission failed', { userId: req.user.id, error })
            next(error)
        }
    }

    async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user.id;
            this._logger.info('fetching verification profile', { userId })
            const result = await this._auctionHouseService.getTenantVerificationProfile(userId)
            SuccessResponse(res, MESSAGES.PROFILE_RETRIEVED, result, HttpStatus.OK)
        } catch (error: unknown) {
            this._logger.warn('Profile retrieval issue', { userId: req.user.id, error })
            next(error)
        }
    }

}