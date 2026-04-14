import { Request, Response, NextFunction } from "express";
import { IAdminController } from "../interfaces/IAdmin.controller";
import { IAdminService } from "../../services/interface/IAdmin.service";
import { ILoggerService } from "../../services/interface/ILogger.service";
import { HttpStatus, MESSAGES } from "../../constants/constants";
import { SuccessResponse } from "../../utils/response.utility";
import { ParamsDictionary } from "express-serve-static-core";
import { UpdateHouseStatusDTO } from "../../dtos/admin.dto/updatestatus.dto";

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

    async getAuctionHouseById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id as string;
            this._logger.info('Admin fetching single auction house details', { id });
            const result = await this._adminService.getAuctionHouseById(id);
            SuccessResponse(
                res,
                MESSAGES.HOUSE_RETRIEVED || "House details retrieved", // Ensure this exists in constants
                result,
                HttpStatus.OK
            );
        } catch (error) {
            next(error);
        }
    }

    async updateAuctionHouseStatus(req: Request<ParamsDictionary, any, UpdateHouseStatusDTO>, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id as string  //service layer expect id as string
            const result = await this._adminService.updateAuctionHouseStatus(id, req.body)
            SuccessResponse(
                res,
                MESSAGES.AUC_HOUSE_STTS_UPDTD,
                result,
                HttpStatus.OK
            )
        } catch (error) {
            next(error)
        }
    }
}