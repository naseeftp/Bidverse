import axiosInstance from "../api/axios.instance";
import { AUCTION_HOUSE_ROUTES } from "../constants/api.constant";
import { apiErrorHandler } from "../utils/error.handle";
import type { AuctionHouseResponseDTO, AuctionHouseSubmissionDTO } from "../types/auctionHouse.type";
import type { ApiResponse } from "../types/auth.type";

class AuctionHouseService {
    async submitVerification(formData: AuctionHouseSubmissionDTO) {
        try {
            const response = await axiosInstance.post<unknown, ApiResponse<AuctionHouseResponseDTO>>(
                AUCTION_HOUSE_ROUTES.VERIFY_HOUSE,
                formData
            )
            return { success: true, message: response.message, ...response.data }
        } catch (error) {
            return apiErrorHandler(error, "Submission failed");
        }
    }
    async getProfile() {
        try {
            const response = await axiosInstance.get<unknown, ApiResponse>(
                AUCTION_HOUSE_ROUTES.GET_PROFILE
            )
            return { success: true, message: response.message, ...(response.data||{}) }
        } catch (error) {
            return apiErrorHandler(error, "Could not load profile");
        }
    }


}

export default new AuctionHouseService()