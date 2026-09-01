import axiosInstance from "../api/axios.instance"
import { BASE_ROUTES, LIVE_ROUTES } from "../constants/api.constant"
import type { AuctionItemDetailDTO} from "../types/auctionItem.dto"
import type { ApiResponse } from "../types/auth.type"
import type { LiveAuctionStateResponseDTO } from "../types/liveState.dto"
import { apiErrorHandler } from "../utils/error.handle"

class LiveService {
    async findLiveState(auctionId: string) {
        try {
            const url = `${BASE_ROUTES.LIVE}${LIVE_ROUTES.GET_LIVE_STATE}/${auctionId}`
            const response = await axiosInstance.get<LiveAuctionStateResponseDTO, ApiResponse<LiveAuctionStateResponseDTO>>(url)
            return {
                success: true,
                data: response.data,
                message: response.message
            }
        } catch (error) {
            return apiErrorHandler(error, 'Failed to find AuctionLive State')
        }
    }
    async joinRoom(auctionId: string) {
        try {
            const url = `${BASE_ROUTES.LIVE}${LIVE_ROUTES.JOIN_ROOM}/${auctionId}`;
            const response = await axiosInstance.get<AuctionItemDetailDTO, ApiResponse<AuctionItemDetailDTO>>(url);
            return {
                success: true,
                message: response.message,
                data: response.data
            }
        } catch (error) {
            return apiErrorHandler(error, 'Failed to join Room')
        }
    }

}
export default new LiveService()