import { AUTH_ROUTES } from '../constants/api.constant'
import axiosInstance from '../api/axios.instance'
import type { RegisterDTO, VerifyOtpDTO, ResendOtpDTO, JwtPayload } from '../types/auth.type'
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
            const response = await axiosInstance.post(AUTH_ROUTES.REGISTER, userData)
            return response
        } catch (error: any) {
            return apiErrorHandler(error, "Registration failed")

        }
    }

    async verifyOtp(otpData: VerifyOtpDTO) {
        try {
            const response = await axiosInstance.post(AUTH_ROUTES.VERIFY_OTP, otpData)
            if (response.data?.accessToken) {
                this.saveToken(response.data.accessToken)
            }
            return response
        } catch (error: any) {

            return apiErrorHandler(error, 'otp verification failed')
        }
    }

    async resendOtp(emailData: ResendOtpDTO) {
        try {
            return await axiosInstance.post(AUTH_ROUTES.RESEND_OTP, emailData)
        } catch (error: any) {

            return apiErrorHandler(error, "failed to resend OTP")
        }
    }
}

export default new AuthService()