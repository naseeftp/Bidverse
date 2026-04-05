import type {
    RegisterUserDTO,
    LoginDTO,
    VerifyotpDTO,
    ResendOtpDTO,
    ForgetPaswordDTO,
    // ForgetPasswordVerifyOtpDTO,
     ResetPasswordDTO,
    // changePasswordDTO,
    AuthResponseDTO,
    UserResponseDTO

} from '../../dtos/Common.dto'

export interface IAuthService {
    register(data: RegisterUserDTO,purpose:string): Promise<{ email: string }>
    verifyOtp(data: VerifyotpDTO): Promise<AuthResponseDTO<UserResponseDTO>| { email: string; message: string; verified: boolean;resetToken:string }>
    resendOtp(data: ResendOtpDTO): Promise<{ email: string; expiresAt: Date }>
    login(data: LoginDTO): Promise<AuthResponseDTO<UserResponseDTO>>
    googleAuth(code:string,role:string):Promise<AuthResponseDTO<UserResponseDTO>>
    forgotPassword(data: ForgetPaswordDTO,purpose:string): Promise<{ email: string; expiresAt: Date }>
    resetPassword(data: ResetPasswordDTO): Promise<void>
   
    
    // changePassword(data: changePasswordDTO): Promise<void>
    // refreshToken(token: string): Promise<{ accessToken: string }>;
}   