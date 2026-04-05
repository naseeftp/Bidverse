import { RegisterUserSchema,LoginSchema,VerifyOtpSchema,ForgetPaswordSchema} from "../dtos/Common.dto";
import {z} from "zod"
export const AuthValidators={
   ValidateRegisterInput: RegisterUserSchema,
   validateLoginInput: LoginSchema,
   validateVerifyOtpInput: VerifyOtpSchema,
   validateResendOtpInput: z.object({ email: z.string().email() }),
   validateForgotPassInput:ForgetPaswordSchema
}