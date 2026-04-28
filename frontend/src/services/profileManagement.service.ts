import axiosInstance from "../api/axios.instance";
import { PROFILE_ROUTES, BASE_ROUTES } from "../constants/api.constant";
import { apiErrorHandler } from "../utils/error.handle";
import type { ApiResponse} from "../types/auth.type";
import type { UserResponseDTO } from "../types/auth.type";


class profileService{
   async getProfile(){
    try {
        const url=`${BASE_ROUTES.PROFILE_MANAGEMENT}${PROFILE_ROUTES.GET_PROFILE}`
        const response=await axiosInstance.get<UserResponseDTO,ApiResponse<UserResponseDTO>>(url)
        return {
            success:true,
            message:response.message,
            data:response.data
        }

    } catch (error) {
        return apiErrorHandler(error,'Failed to get ProfileData')
    }
   }
}

export default new profileService()