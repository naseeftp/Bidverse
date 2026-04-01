import {
    validateEmail,
    validatePhone,
    validateRequired,
    validateLength

} from "../utils/validation.utils";

import {
    validatePassword,
    validatePasswordMatch
} from "../utils/password.util";
import { ValidationError } from "../errors/AppError";
import { MESSAGES } from "../constants/constants";
import type {
    RegisterUserDTO,
    VerifyotpDTO,
    ResendOtpDTO,
    LoginDTO
} from "../dtos/Common.dto";
// using dto zod/ class validsators itslf
export class AuthValidators {
    static ValidateRegisterInput(data: RegisterUserDTO): void {
        validateRequired(data.email, "Email");
        validateRequired(data.name, "Name");
        validateRequired(data.password, "Password")
        validateRequired(data.confirmPassword, 'Confirm Password')
        validateRequired(data.phone, "Phone number needed")

        if (!validateEmail(data.email)) {
            throw new ValidationError(MESSAGES.INVALID_EMAIL_FORMAT)
        }
        if (!validatePhone(data.phone)) {
            throw new ValidationError(MESSAGES.INVALID_PHONE_NUMBER)
        }
        validateLength(data.name, 2, 50, "Name")
        validatePassword(data.password)
        validatePasswordMatch(data.password, data.confirmPassword)

    }
    static validateVerifyOtpInput(data: VerifyotpDTO): void {
        validateRequired(data.email, "Email")
        validateRequired(data.otp, 'OTP')

        if (!validateEmail(data.email)) {
            throw new ValidationError(MESSAGES.INVALID_EMAIL_FORMAT)
        }
        if (data.otp.trim().length < 6) {
            throw new ValidationError(MESSAGES.OTP_INVALID_OR_EXPIRED)
        }
    }
    static validateResendOtpInput(data: ResendOtpDTO): void {
        validateRequired(data.email, 'Email')
        if (!validateEmail) {
            throw new ValidationError(MESSAGES.INVALID_EMAIL_FORMAT)
        }
    }
    static validateLoginInput(data:LoginDTO):void{
      validateRequired(data.email,'Email')
      validateRequired(data.password,'Password')
      if(!validateEmail(data.email)){
        throw new ValidationError(MESSAGES.INVALID_EMAIL_FORMAT)
      }
       validatePassword(data.password)
    }


}