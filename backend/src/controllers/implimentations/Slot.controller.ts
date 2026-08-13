import { Request, Response, NextFunction } from "express";
import { ISlotController } from "../interfaces/ISlot.controller";
import { ISlotService } from "../../services/interface/ISlot.service";
import { SuccessResponse } from "../../utils/response.utility";
import { HttpStatus, MESSAGES } from "../../constants/constants";

export class SlotController implements ISlotController {
    constructor(
        private _slotService: ISlotService
    ) { }
    async bookSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user.id;
            const data = req.body;
            const result = await this._slotService.bookSlot(userId, data)
            SuccessResponse(res, MESSAGES.SLOT_BOOKED, result, HttpStatus.CREATED)
        } catch (error) {
            next(error)
        }
    }
    async listAllSlotForUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user.id;
            const page = Number(req.query.page);
            const limit = Number(req.query.limit);
            const result = await this._slotService.listAllSlotForUser(userId, page, limit);
            SuccessResponse(res, MESSAGES.LIST_RETRIEVED, result, HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
}