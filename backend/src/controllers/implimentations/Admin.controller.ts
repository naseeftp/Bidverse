import { Request, Response, NextFunction } from "express";
import { IAdminController } from "../interfaces/IAdmin.controller";
import { IAdminService } from "../../services/interface/IAdmin.service";
import { ILoggerService } from "../../services/interface/ILogger.service";
import { HttpStatus, MESSAGES } from "../../constants/constants";
import { SuccessResponse } from "../../utils/response.utility";

export class AdminController implements IAdminController {
    constructor(
        private _adminService: IAdminService,
        private _logger: ILoggerService
    ) { }
    async getAuctionHouses(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            this._logger.info('admin fetching auction houses list', {
                adminId: req.user?.id,
                page,
                limit
            })
            const result = await this._adminService.listAllAuctionHouses(page, limit);
            SuccessResponse(
                res,
                MESSAGES.LIST_RETRIEVED,
                result,
                HttpStatus.OK
            )
        } catch (error) {
            this._logger.error('admin controller failed to list auction house', {
                adminId: req.user?.id.charAt,
                error
            })
            next(error)
        }
    }
}