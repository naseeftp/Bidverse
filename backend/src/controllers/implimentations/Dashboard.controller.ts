import { IDashboardController } from "../interfaces/IDashboard.controller";
import { IDashboardService } from "../../services/interface/IDashboard.service";
import { Request, Response, NextFunction } from "express";
import { SuccessResponse } from "../../utils/response.utility";
import { HttpStatus, MESSAGES } from "../../constants/constants";
export class DashboardController implements IDashboardController {
    constructor(
        private _dashboardService: IDashboardService
    ) { }
    async getAdminDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await this._dashboardService.getAdminDashboard();
            SuccessResponse(res, MESSAGES.ACTION_SUCCESS, result, HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
}