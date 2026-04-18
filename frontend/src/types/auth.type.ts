export const Roles = {
    USER: 'user',
    ADMIN: 'admin',
    TENANT: "tenant"
} as const

export type userRole = typeof Roles[keyof typeof Roles]
export interface RegisterDTO {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string
    role?: userRole
}
export interface VerifyOtpDTO {
    email: string,
    otp: string;
    role: string,
    purpose?: 'registration' | 'forgot_password'
}

export interface ResendOtpDTO {
    email: string;
    role?:string
}
export interface OtpResponseData {
    email: string;
    expiresAt: string;
}

export interface JwtPayload {
    userId: string;
    email: string;
    role: userRole;
    name: string;
    exp: number
}
export interface LoginDto {
    email: string,
    password: string,
    role?: userRole
}
export interface ForgetPaswordDTO {
    email: string,
    role?: string
}

export interface ResetPasswordDTO {
    email: string;
    password: string;
    confirmPassword: string;
    resetToken: string;
}

export interface ApiResponse<T=unknown> {
    success: boolean;
    message: string;
    data?: T
}