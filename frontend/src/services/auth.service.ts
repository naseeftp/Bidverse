import { AUTH_ROUTES } from '../constants/api.constant'
import axiosInstance from '../api/axios.instance'
import type {
    RegisterDTO,
    LoginDto,
    VerifyOtpDTO,
    ResendOtpDTO,
    JwtPayload,
    ApiResponse,
    ForgetPaswordDTO,
    ResetPasswordDTO
} from '../types/auth.type'
import { apiErrorHandler } from '../utils/error.handle'

interface AuthSuccessData {
    token: string;
    user: JwtPayload;
}

interface RegisterSuccessData {
    user: Omit<JwtPayload, 'exp'>;
}

interface ResendOtpData {
    expiresAt: string;
}

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

            const response = await axiosInstance.post<unknown, ApiResponse<RegisterSuccessData>>(AUTH_ROUTES.REGISTER, userData)
            return {
                success: true,
                message: response.message,
                data: response.data
            };
        } catch (error: unknown) {
            return apiErrorHandler(error, "Registration failed")
        }
    }

    async verifyOtp(otpData: VerifyOtpDTO) {
        try {

            const response = await axiosInstance.post<unknown, ApiResponse<AuthSuccessData>>(AUTH_ROUTES.VERIFY_OTP, otpData)
            const data = response.data

            if (data?.token) {
                this.saveToken(data.token)
            }
            return { message: response.message, data, success: true }
        } catch (error: unknown) {
            return apiErrorHandler(error, 'otp verification failed')
        }
    }

    async resendOtp(emailData: ResendOtpDTO) {
        try {
            const response = await axiosInstance.post<unknown, ApiResponse<ResendOtpData>>(AUTH_ROUTES.RESEND_OTP, emailData)
            return { message: response.message, success: true, data: response.data }
        } catch (error: unknown) {
            return apiErrorHandler(error, "failed to resend OTP")
        }
    }

    async login(userData: LoginDto) {
        try {
            const response = await axiosInstance.post<unknown, ApiResponse<AuthSuccessData>>(AUTH_ROUTES.LOGIN, userData)
            return { message: response.message, success: true, data: response.data }
        } catch (error: unknown) {
            return apiErrorHandler(error, 'user login failed')
        }
    }
    async logout() {
        try {
            await axiosInstance.get(AUTH_ROUTES.LOGOUT)
        } catch (error: unknown) {
            return apiErrorHandler(error, 'Logout failed')
        }
    }
    async forgotpass(emailData: ForgetPaswordDTO) {
        try {

            const response = await axiosInstance.post<unknown, ApiResponse<Record<string, never>>>(AUTH_ROUTES.FORGOT_PASS, emailData)
            return { message: response.message, success: true, data: response.data }
        } catch (error: unknown) {
            return apiErrorHandler(error, 'failed to send otp')
        }
    }

    async resetPassword(resetData: ResetPasswordDTO) {
        try {
            const response = await axiosInstance.patch<unknown, ApiResponse<Record<string, never>>>(AUTH_ROUTES.RESET_PASSWORD, resetData);
            return { success: true, message: response.message, data: response.data };
        } catch (error: unknown) {
            return apiErrorHandler(error, "Failed to reset password. Please try again.");
        }
    }
}

export default new AuthService()