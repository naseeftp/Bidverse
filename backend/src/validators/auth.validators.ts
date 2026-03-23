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
    ResendOtpDTO
} from "../dtos/Common.dto";

export class AuthValidators {
    static ValidateRegisterInput(data: RegisterUserDTO): void {
        validateRequired(data.email, "Email");
        validateRequired(data.name, "Name");
        validateRequired(data.password, "Password")
        validateRequired(data.confirmPassword, 'Confirm Password')
        validateRequired(data.phone, "Phone number needed")

        if (!validateEmail(data.email)) {
            throw new ValidationError(MESSAGES.INVALID_ID_FORMAT)
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


}