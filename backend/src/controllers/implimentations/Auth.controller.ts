import { Request, Response, NextFunction } from "express";
import { RegisterUserDTO, ResendOtpDTO, VerifyotpDTO, LoginDTO, ForgetPaswordDTO, ResetPasswordDTO } from "../../dtos/Common.dto";
import { IAuthController } from "../interfaces/IAuth.controller";
import { HttpStatus, MESSAGES} from "../../constants/constants";
import { SuccessResponse } from "../../utils/response.utility";
import { IAuthService } from "../../services/interface/IAuth.service";
import { ParamsDictionary } from "express-serve-static-core";
import { roles } from "../../types/user.type";
import { oauth2Client, googleScopes } from "../../config/google.confing";

export class AuthController implements IAuthController {
    constructor(
        private _authService: IAuthService
    ) { }

    async register(req: Request<ParamsDictionary,Record<string, unknown>, RegisterUserDTO>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const purpose = 'registration'
            const result = await this._authService.register(req.body, purpose)
            SuccessResponse(res, MESSAGES.OTP_SENT, result, HttpStatus.OK)

        } catch (error: unknown) {
            next(error)
        }
    }

    async verifyOtp(req: Request<ParamsDictionary, unknown, VerifyotpDTO>, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await this._authService.verifyOtp(req.body)
            SuccessResponse(res, MESSAGES.REGISTRATION_COMPLETE, result, HttpStatus.CREATED)
        } catch (error: unknown) {
            next(error)
        }
    }
    async resendOtp(req: Request<ParamsDictionary, unknown, ResendOtpDTO>, res: Response, next: NextFunction): Promise<void> {
        try {
            await this._authService.resendOtp(req.body)
            SuccessResponse(res, MESSAGES.OTP_RESENT, undefined, HttpStatus.OK)
        } catch (error: unknown) {
            next(error)
        }
    }
    async login(req: Request<ParamsDictionary, unknown, LoginDTO>, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await this._authService.login(req.body);
            SuccessResponse(res, MESSAGES.LOGIN_SUCCESS, result, HttpStatus.OK)

        } catch (error: unknown) {
            next(error)
        }
    }

    async forgotPass(req: Request<Record<string,unknown>, unknown, ForgetPaswordDTO>, res: Response, next: NextFunction): Promise<void> {
        try {
            const purpose = 'forgot_password';
            const result = await this._authService.forgotPassword(req.body, purpose)
            SuccessResponse(res, MESSAGES.PASSWORD_RESET_OTP, result, HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }

    async resetPassword(req: Request<Record<string, unknown>, unknown, ResetPasswordDTO>, res: Response, next: NextFunction): Promise<void> {
        try {
            await this._authService.resetPassword(req.body)
            return SuccessResponse(res, MESSAGES.PASSWORD_RESET_SUCCESS, null, HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }

    async redirectToGoogle(req: Request, res: Response): Promise<void> {
        const role = (req.query.role as string) || 'user';

        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: googleScopes,
            state: role, // We pass the role here; Google will return it in the callback
        });

        res.redirect(url);
    }
    async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { code, state } = req.query;
        const role = (state as roles) || 'user'; // Fallback to user if state is missing
        const loginPath = role === 'tenant' ? '/tenant/login' : '/login';
        try {
            if (!code) {
                res.redirect(`${process.env.FRONTEND_URL}${loginPath}?error=Authorization code missing`);
                return;
            }
            const result = await this._authService.googleAuth(
                code as string,
                role
            );
            res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${result.token}`);

        } catch (error:unknown) {
            const message = error instanceof Error ? error.message : "Authentication failed";
            const errorMessage = encodeURIComponent(message);
            res.redirect(`${process.env.FRONTEND_URL}${loginPath}?error=${errorMessage}`);
            next(error)
        }
    }
}