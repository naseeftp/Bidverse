import { otpPurpose, Roles } from "../constants/constants";


export enum Role {
    ADMIN = 'admin',
    TENANT = 'tenant',
    USER = 'user'
}


// export interface RegisterUserDTO {
//     name: string;
//     email: string;
//     password: string;
//     confirmPassword: string;
//     phone: string;
//     role?: typeof Roles[keyof typeof Roles]
// }



// export interface LoginDTO {
//     email: string;
//     password: string;
//     role: string
// }

// export interface VerifyotpDTO {
//     email: string;
//     otp: string;
//     role: string
// }
// export interface SendotpDTO {
//     email: string;
//     otp: string;
// }
// export interface ResendOtpDTO {
//     email: string
// }

// export interface ForgetPaswordDTO {
//     email: string;
//     role: string
// }
// export interface ForgetPasswordVerifyOtpDTO {
//     email: string;
//     otp: string
// }
// export interface ResetPasswordDTO {
//     email: string;
//     resetToken: string;
//     newPassword: string;
//     confirmPassword: string
// }

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
    isActive: boolean
}

export interface AuthResponseDTO<T = UserResponseDTO> {
    user: T;
    token: string;
    refreshToken?: string;
}
import {email, z} from 'zod'

const passwordRules=z.string()
.min(8,'Password Must be at least 8 charactors')
.regex(/[A-Z]/,'Password Must Contai an upperCase Letter')
.regex(/[0-9]/,'Password Must Contain a  number')
.regex(/[^A-Za-z0-9]/,'Password Must contain A special charactor')

export const RegisterUserSchema=z.object({
    name:z.string().min(2,'Name is too short').max(50),
    email: z.string().email("Invalid email format"),
    password:passwordRules,
    confirmPassword:z.string(),
    phone:z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
    role: z.enum(['admin', 'tenant', 'user']).optional().default('user'),
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
export const ForgetPaswordSchema=z.object({
  email:z.string().email(),
  role:z.enum(['tenant', 'user'])
})

export const GoogleCallbackSchema=z.object({
  code:z.string().min(1,'Authorization code is required'),
  state: z.enum(['admin', 'tenant', 'user']).default('user')
});

export type RegisterUserDTO=z.infer<typeof RegisterUserSchema>;
export type LoginDTO=z.infer<typeof LoginSchema>;
export type VerifyotpDTO=z.infer<typeof VerifyOtpSchema>;
export type ResendOtpDTO={email:string,purpose?:otpPurpose}
export type ForgetPaswordDTO=z.infer<typeof ForgetPaswordSchema>
export type GoogleCallbackDTO=z.infer<typeof GoogleCallbackSchema>