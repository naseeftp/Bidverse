import { Request, Response, NextFunction } from "express";
import {
    RegisterUserDTO,
    VerifyotpDTO,
    ResendOtpDTO,
    LoginDTO,
    Role
} from "../../dtos/Common.dto";

export interface IAuthController{
    register(
        req:Request<Record<string,never>,unknown,RegisterUserDTO>,
        res:Response,
        next:NextFunction
    ):Promise<void>

    verifyOtp(
        req:Request<Record<string,never>,unknown,VerifyotpDTO&{role?:Role}>,
        res:Response,
        next:NextFunction
    ):Promise<void>
    resendOtp(
        req:Request<Record<string,never>,unknown,ResendOtpDTO>,
        res:Response,
        next:NextFunction
    ):Promise<void>
    redirectToGoogle(req: Request, res: Response): Promise<void>;
    googleCallback(req: Request, res: Response, next: NextFunction): Promise<void>;
}