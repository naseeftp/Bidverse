import { Roles } from "../constants/constants";


export interface RegisterUserDTO {
    name: string;
    email: string;
    password?: string;
    confirmPassword?: string;
    phone?: string;
    role?: typeof Roles[keyof typeof Roles]
}

export interface UserResponseDTO {
    id: string,
    name: string;
    email: string;
    phone?: string;
    role: string;
    profileImage?: string | null;
    isActive: boolean
}

export interface LoginDTO {
    email: string;
    password: string;
    role: string
}

export interface VerifyotpDTO {
    email: string;
    otp: string;
    role: string
}
export interface SendotpDTO {
    email: string;
    otp: string;
}
export interface ResendOtpDTO {
    email: string
}

export interface ForgetPaswordDTO {
    email: string;
    role: string
}
export interface ForgetPasswordVerifyOtpDTO {
    email: string;
    otp: string
}
export interface ResetPasswordDTO {
    email: string;
    resetToken: string;
    newPassword: string;
    confirmPassword: string
}

export interface changePasswordDTO {
    userId: string;
    oldPassword: string;
    newPassword: string;
    confirmPassword: string
}

export interface AuthResponseDTO<T = UserResponseDTO> {
    user: T;
    token: string;
    refreshToken?: string;
}