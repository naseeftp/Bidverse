import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { HttpStatus, MESSAGES } from "../constants/constants";

export const errorHandler = (err: Error | AppError, req: Request, res: Response, _next: NextFunction): void => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message
        })
        return
    }
    if (err.name === 'ValidationError') {
        res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            message: err.message
        })
        return
    }
    if (err.name === 'CastError') {
        res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            message: MESSAGES.INVALID_ID_FORMAT
        })
        return
    }
    const message = err instanceof Error ? err.message : MESSAGES.SERVER_ERROR
    res.status(HttpStatus.INTERNAL_ERROR).json({
        success: false,
        message: message
    })

}