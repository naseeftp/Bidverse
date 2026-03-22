import { Request,Response,NextFunction} from "express";
import { RegisterUserDTO,ResendOtpDTO,VerifyotpDTO } from "../../dtos/Common.dto";
import { IAuthController } from "../interfaces/IAuth.controller";
import { HttpStatus,MESSAGES,Roles } from "../../constants/constants";