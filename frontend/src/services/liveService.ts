import axiosInstance from "../api/axios.instance"
import { BASE_ROUTES, LIVE_ROUTES } from "../constants/api.constant"
import type { ApiResponse } from "../types/auth.type"
import type { LiveAuctionStateResponseDTO } from "../types/liveState.dto"
import { apiErrorHandler } from "../utils/error.handle"

class LiveService{
async findLiveState(auctionId:string){
    try {
      const url=`${BASE_ROUTES.LIVE}${LIVE_ROUTES.GET_LIVE_STATE}/${auctionId}`  
      const response=await axiosInstance<LiveAuctionStateResponseDTO,ApiResponse<LiveAuctionStateResponseDTO>>(url)
      return {
        success:true,
        data:response.data,
        message:response.message
      }
    } catch (error) {
        return apiErrorHandler(error,'Failed to find AuctionLive State')
    }
}

}
export default new LiveService()