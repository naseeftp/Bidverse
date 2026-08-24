import { Request, Response, NextFunction } from "express";
import { INotificationService } from "../../services/interface/INotification.service";
import { INotificationController } from "../interfaces/INotification.controller";
import { SuccessResponse } from "../../utils/response.utility";
import { HttpStatus, MESSAGES } from "../../constants/constants";

export class NotificationController implements INotificationController {
    constructor(
        private _notificationService: INotificationService
    ) { }

    async findAllNotificationForUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user.id;
            const result = await this._notificationService.findAllNotificationForUser(userId);
            SuccessResponse(res, MESSAGES.LIST_RETRIEVED, result, HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
}