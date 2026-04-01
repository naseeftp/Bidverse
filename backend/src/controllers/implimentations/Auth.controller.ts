import { Request, Response, NextFunction } from "express";
import { RegisterUserDTO, ResendOtpDTO, Role, VerifyotpDTO,LoginDTO} from "../../dtos/Common.dto";
import { IAuthController } from "../interfaces/IAuth.controller";
import { HttpStatus, MESSAGES, Roles } from "../../constants/constants";
import { SuccessResponse, ErrorResponse } from "../../utils/response.utility";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.utils";
import { IUserDocument } from "../../types/user.type";
import { IAuthService } from "../../services/interface/IAuth.service";
import { ParamsDictionary } from "express-serve-static-core";
export class AuthController implements IAuthController {
    constructor(
        private _authService: IAuthService
    ) { }

    async register(req: Request<ParamsDictionary, any, RegisterUserDTO>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
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
    async resendOtp(req: Request<ParamsDictionary, unknown, ResendOtpDTO>, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto = req.body;
            const result = await this._authService.resendOtp(dto)
            SuccessResponse(res, MESSAGES.OTP_RESENT, undefined, HttpStatus.OK)

        } catch (error: unknown) {
            next(error)
        }
    }
    async login( req:Request<ParamsDictionary,any,LoginDTO>, res:Response,next:NextFunction):Promise<void>{
       try {
        const dto=req.body;
        const result=await this._authService.login(dto);
        SuccessResponse(res,MESSAGES.LOGIN_SUCCESS,result,HttpStatus.OK)

       } catch (error:unknown) {
        next(error)
       } 
    }


}