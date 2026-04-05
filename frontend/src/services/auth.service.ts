import { AUTH_ROUTES } from '../constants/api.constant'
import axiosInstance from '../api/axios.instance'
import type {
    RegisterDTO
    , LoginDto,
    VerifyOtpDTO,
    ResendOtpDTO,
    JwtPayload,
    ApiResponse,
    ForgetPaswordDTO
} from '../types/auth.type'
import { apiErrorHandler } from '../utils/error.handle'


class AuthService {
    private saveToken(token: string): void {
        localStorage.setItem("accessToken", token)
    }
    private decodeToken(token: string): JwtPayload | null {
        try {
            return JSON.parse(atob(token.split('.')[1]))
        } catch {
            return null
        }
    }
    async register(userData: RegisterDTO) {
        try {
            const response = await axiosInstance.post<any, ApiResponse>(AUTH_ROUTES.REGISTER, userData) // make sure that response similar to backend 
            return {
                success: true,
                message: response.message,
                ...response.data
            };
        } catch (error: any) {
            return apiErrorHandler(error, "Registration failed")

        }
    }

    async verifyOtp(otpData: VerifyOtpDTO) {
        try {
            const response = await axiosInstance.post<any, ApiResponse>(AUTH_ROUTES.VERIFY_OTP, otpData)
            const data = response.data
            if (data?.token) {
                this.saveToken(data.token)
            }
            return { message: response.message, ...data, success: true }
        } catch (error: any) {

            return apiErrorHandler(error, 'otp verification failed')
        }
    }

    async resendOtp(emailData: ResendOtpDTO) {
        try {
            const response = await axiosInstance.post<any, ApiResponse>(AUTH_ROUTES.RESEND_OTP, emailData)
            return { message: response.message, success: true, ...response.data }
        } catch (error: any) {

            return apiErrorHandler(error, "failed to resend OTP")
        }
    }

    async login(userData: LoginDto) {
        try {
            const response = await axiosInstance.post<any, ApiResponse>(AUTH_ROUTES.LOGIN, userData)
            return { message: response.message, success: true, ...response.data }
        } catch (error: any) {
            return apiErrorHandler(error, 'user login failed')
        }
    }
    async forgotpass(emailData:ForgetPaswordDTO){
        try {
            const response=await axiosInstance.post<any,ApiResponse>(AUTH_ROUTES.FORGOT_PASS,emailData)
            return {message:response.message,success:true,...response.data}
        } catch (error:any) {
            return apiErrorHandler(error,'failed to send otp')
        }
    }

}

export default new AuthService()