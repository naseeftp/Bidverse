import type {
    RegisterUserDTO,
    LoginDTO,
    VerifyotpDTO,
    ResendOtpDTO,
    ForgetPaswordDTO,
    ForgetPasswordVerifyOtpDTO,
    ResetPasswordDTO,
    changePasswordDTO,
    AuthResponseDTO,
    UserResponseDTO

} from '../../dtos/Common.dto'

export interface IAuthService {
    register(data: RegisterUserDTO): Promise<{ email: string }>
    verifyOtp(data: VerifyotpDTO): Promise<AuthResponseDTO<UserResponseDTO>>
    resendOtp(data: ResendOtpDTO): Promise<void>
    // login(data: LoginDTO): Promise<AuthResponseDTO<UserResponseDTO>>
    // forgotPassword(data: ForgetPaswordDTO): Promise<void>
    // forgetPasswordVerifyOtp(data: ForgetPasswordVerifyOtpDTO): Promise<{ resetToken: string }>
    // resetPassword(data: ResetPasswordDTO): Promise<void>
    // changePassword(data: changePasswordDTO): Promise<void>
    // refreshToken(token: string): Promise<{ accessToken: string }>;
}   