import { Request, Response, NextFunction } from "express";
import { HttpStatus, MESSAGES } from "../constants/constants";
import UserModel from "../models/user.model";
import { LoggerService } from "../services/implementations/Logger.service";

const logger = new LoggerService('CheckUserBlocked')
export const CheckUserBlocked = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: MESSAGES.UNAUTHORIZED
            })
            return next()
        }
        const user = await UserModel.findById(userId).select("isActive BlockingReson")
        if (!user) {
            res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: MESSAGES.USER_NOT_FOUND
            })
            return
        }
        if (user.isActive === false) {
            logger.warn(`Access Denied: Blocked user ${userId} tried an action`)
            res.status(HttpStatus.FORBIDDEN).json({
                success: false,
                message: MESSAGES.USER_BLOCKED,
                reason: user.BlockingReson
            })
            return
        }
        next()
    } catch (error) {
        logger.error('Check user block error', error)
        res.status(HttpStatus.INTERNAL_ERROR).json({
            success: false,
            message: MESSAGES.SERVER_ERROR
        })
    }
}