import axiosInstance from "../api/axios.instance";
import { PROFILE_ROUTES, BASE_ROUTES } from "../constants/api.constant";
import { apiErrorHandler } from "../utils/error.handle";
import type { ApiResponse } from "../types/auth.type";
import type { UserResponseDTO } from "../types/auth.type";
import type {
    ChangeEmaiLResponseDTO,
    ProfileDetailChangeFormData,
    changeEmailDTO,
    changeEmailVerificationDTO,
    changePasswordDTO
} from '../types/profile.dto'


class profileService {
    async getProfile() {
        try {
            const url = `${BASE_ROUTES.PROFILE_MANAGEMENT}${PROFILE_ROUTES.GET_PROFILE}`
            const response = await axiosInstance.get<UserResponseDTO, ApiResponse<UserResponseDTO>>(url)
            return {
                success: true,
                message: response.message,
                data: response.data
            }

        } catch (error) {
            return apiErrorHandler(error, 'Failed to get ProfileData')
        }
    }
    async changeProfileDetails(data: ProfileDetailChangeFormData) {
        try {
            const url = `${BASE_ROUTES.PROFILE_MANAGEMENT}${PROFILE_ROUTES.CHANGE_DETAILS}`
            const response = await axiosInstance.patch<UserResponseDTO, ApiResponse<UserResponseDTO>>(url, data)
            return {
                success: true,
                message: response.message,
                data: response.data
            }
        } catch (error) {
            return apiErrorHandler(error, 'Failed to change ProfileData')
        }
    }
    async changePassword(data: changePasswordDTO) {
        try {
            const url = `${BASE_ROUTES.PROFILE_MANAGEMENT}${PROFILE_ROUTES.CHANGE_PASSWORD}`
            const response = await axiosInstance.patch<UserResponseDTO, ApiResponse<UserResponseDTO>>(url, data)
            return {
                success: true,
                message: response.message,
                data: response.data
            }
        } catch (error) {
            return apiErrorHandler(error, 'Failed to change Password')
        }
    }
    async changeEmail(data: changeEmailDTO) {
        try {
            const url = `${BASE_ROUTES.PROFILE_MANAGEMENT}${PROFILE_ROUTES.CHANGE_EMAIL}`
            const response = await axiosInstance.patch<ChangeEmaiLResponseDTO, ApiResponse<ChangeEmaiLResponseDTO>>(url, data)
            return {
                success: true,
                message: response.message,
                data: response.data
            }
        } catch (error) {
            return apiErrorHandler(error, 'Failed to changeEmail')
        }
    }
    async changeEmailVerification(data: changeEmailVerificationDTO){
        try {
            const url=`${BASE_ROUTES.PROFILE_MANAGEMENT}${PROFILE_ROUTES.CHANGE_EMAIL_VERIFY}`
            const response=await axiosInstance.post<UserResponseDTO,ApiResponse<UserResponseDTO>>(url,data)
            return {
                success:true,
                message:response.message,
                data:response.data
            }
        } catch (error) {
            return apiErrorHandler(error, 'Otp Verification failed')
        }
    }
}

export default new profileService()