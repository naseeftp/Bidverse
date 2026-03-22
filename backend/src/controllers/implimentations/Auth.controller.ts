import { Request, Response, NextFunction } from "express";
import { RegisterUserDTO, ResendOtpDTO, Role, VerifyotpDTO } from "../../dtos/Common.dto";
import { IAuthController } from "../interfaces/IAuth.controller";
import { HttpStatus, MESSAGES, Roles } from "../../constants/constants";
import { SuccessResponse, ErrorResponse } from "../../utils/response.utility";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.utils";
import { IUserDocument } from "../../types/user.type";
import { IAuthService } from "../../services/interface/IAuth.service";

export class AuthController implements IAuthController {
    constructor(
        private _authService: IAuthService
    ) { }

    async register(req: Request<Record<string, never>, unknown, RegisterUserDTO>, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto = req.body;
            const result = await this._authService.register(dto)
            SuccessResponse(res, MESSAGES.OTP_SENT, result, HttpStatus.OK)

        } catch (error: unknown) {
            next(error)
        }
    }

    async verifyOtp(req: Request<Record<string, never>, unknown, VerifyotpDTO & { role?: Role; }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto = req.body;
            const result = await this._authService.verifyOtp({
                email: dto.email,
                otp: dto.otp,
                role: dto.role,
            })
            SuccessResponse(res, MESSAGES.REGISTRATION_COMPLETE, result, HttpStatus.CREATED)
        } catch (error: unknown) {
            next(error)
        }
    }
    async resendOtp(req: Request<Record<string, never>, unknown, ResendOtpDTO>, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto = req.body;
            await this._authService.resendOtp(dto)
            SuccessResponse(res, MESSAGES.OTP_RESENT, undefined, HttpStatus.OK)

        } catch (error: unknown) {
            next(error)
        }
    }

}