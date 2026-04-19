import { Request, Response, NextFunction } from "express";
import {
    RegisterUserDTO,
    VerifyotpDTO,
    ResendOtpDTO,
    LoginDTO,
    ForgetPaswordDTO,
    Role,
    ResetPasswordDTO
} from "../../dtos/Common.dto";


export interface IAuthController {
    register(
        req: Request<Record<string, never>, unknown, RegisterUserDTO>,
        res: Response,
        next: NextFunction
    ): Promise<void>

    verifyOtp(
        req: Request<Record<string, never>, unknown, VerifyotpDTO & { role?: Role }>,
        res: Response,
        next: NextFunction
    ): Promise<void>
    resendOtp(
        req: Request<Record<string, never>, unknown, ResendOtpDTO>,
        res: Response,
        next: NextFunction
    ): Promise<void>
    login(
        req: Request<Record<string, never>, unknown, LoginDTO>,
        res: Response,
        next: NextFunction
    ): Promise<void>;
    forgotPass(
        req: Request<Record<string,unknown>, unknown, ForgetPaswordDTO>,
        res: Response,
        next: NextFunction
    ): Promise<void>
    resetPassword(
        req: Request<Record<string,unknown>, unknown, ResetPasswordDTO>,
        res: Response,
        next: NextFunction
    ): Promise<void>;
    refreshToken(req:Request,res:Response,next:NextFunction):Promise<void>
    redirectToGoogle(req: Request, res: Response): Promise<void>;
    googleCallback(req: Request, res: Response, next: NextFunction): Promise<void>;
}