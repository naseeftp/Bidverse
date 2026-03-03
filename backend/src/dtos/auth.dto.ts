import { Roles } from "../constants/constants";

export interface RegisterUserDTO{
    name:string;
    email:string;
    password?:string;
    confirmPassword?: string;
    phone?:string;
    role?:typeof Roles[keyof typeof Roles]
}

export interface UserResponseDTO{
    id:string,
    name:string;
    email:string;
    phone?:string;
    role:string;
    profileImage?:string|null;
    isActive:boolean
}
export interface VerifyotpDTO{
    email:string;
    otp:string;
    role:string
}
export interface sendotpDTO{
  email:string;
  otp:string;
}