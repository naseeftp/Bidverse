import { response, Response } from "express";
import { ApiResponse } from "../types/response.type";
import { HttpStatus } from "../constants/constants";

export const SuccessResponse = <T = unknown>(
    res: Response,
    message?: string,
    data?: T,
    statusCode: number = HttpStatus.OK
): void => {

    const response: ApiResponse<T> = {
        success: true
    }
    if (message) {
        response.message = message
    }
    if (data !== undefined) {
        response.data = data
    }
    res.status(statusCode).json(response)

}

export const ErrorResponse = (
    res: Response,
    message?: string,
    statusCode: number = HttpStatus.INTERNAL_ERROR
): void => {
    res.status(statusCode).json({
        success: false,
        message
    })

}