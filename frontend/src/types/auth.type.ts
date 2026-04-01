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
    role: string
}

export interface ResendOtpDTO {
    email: string
}

export interface JwtPayload{
    userId:string;
    email:string;
    role:string;
    name:string;
    exp:number
}

export interface ApiResponse<T=any>{
    success:boolean;
    message:string;
    data?:T
}