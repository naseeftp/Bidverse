import { otpPurpose} from "../constants/constants";


export enum Role {
  ADMIN = 'admin',
  TENANT = 'tenant',
  USER = 'user'
}
// export interface changePasswordDTO {
//     userId: string;
//     oldPassword: string;
//     newPassword: string;
//     confirmPassword: string
// }
export interface UserResponseDTO {
  id: string,
  name: string;
  email: string;
  phone?: string;
  role: string;
  profileImage?: string | null;
  isActive: boolean;
  BlockingReson?:string
}

export interface AuthResponseDTO<T = UserResponseDTO> {
  user: T;
  token: string;
  refreshToken?: string;
}
import { z } from 'zod'

const passwordRules = z.string()
  .min(8, 'Password Must be at least 8 charactors')
  .max(32,'Password cannot exceed 32 characters')
  .regex(/[A-Z]/, 'Password Must Contai an upperCase Letter')
  .regex(/[0-9]/, 'Password Must Contain a  number')
  .regex(/[^A-Za-z0-9]/, 'Password Must contain A special charactor')

export const RegisterUserSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(50,'Name cannot exceed 50 characters'),
  email: z.string().email("Invalid email format").max(100,'Email is too long'),
  password: passwordRules,
  confirmPassword: z.string().max(32,'Confirm Password cannot too long'),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  role: z.enum(['tenant', 'user']).optional().default('user'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(['admin', 'tenant', 'user'])
});

export const VerifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
  role: z.string().optional(),
  purpose: z.enum(['registration', 'forgot_password']).default('registration')
});
export const ForgetPaswordSchema = z.object({
  email: z.string().email(),
  role: z.enum(['tenant', 'user'])
})

export const ResetPasswordSchema = z.object({
  email: z.string().email('Invalid email Format').max(100),
  password: passwordRules,
  confirmPassword: z.string().max(32),
  resetToken: z.string().min(1, 'Reset Token Is Required').max(255, 'Reset token too long')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const GoogleCallbackSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.enum(['admin', 'tenant', 'user']).default('user')
});

export type RegisterUserDTO = z.infer<typeof RegisterUserSchema>;
export type LoginDTO = z.infer<typeof LoginSchema>;
export type VerifyotpDTO = z.infer<typeof VerifyOtpSchema>;
export type ResendOtpDTO = { email: string, purpose?: otpPurpose }
export type ForgetPaswordDTO = z.infer<typeof ForgetPaswordSchema>
export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>
export type GoogleCallbackDTO = z.infer<typeof GoogleCallbackSchema>