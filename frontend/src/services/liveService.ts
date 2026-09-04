import axiosInstance from "../api/axios.instance"
import { BASE_ROUTES, LIVE_ROUTES } from "../constants/api.constant"
import type { AuctionItemDetailDTO} from "../types/auctionItem.dto"
import type { ApiResponse } from "../types/auth.type"
import type { bidResponseDTO, placeBidDTO } from "../types/bid.dto"
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
    async startLive(auctionId:string){
        try {
            const url=`${BASE_ROUTES.LIVE}${LIVE_ROUTES.START_LIVE}`;
            const response=await axiosInstance.patch<LiveAuctionStateResponseDTO,ApiResponse<LiveAuctionStateResponseDTO>>(url,{auctionId:auctionId});
            return{
                success:true,
                message:response.message,
                data:response.data
            }
        } catch (error) {
           return apiErrorHandler(error,'Failed to Start Live')
        }
    }
    async placeBid(auctionId:string,amount:number,tenantId:string){
        try {
            const url=`${BASE_ROUTES.LIVE}${LIVE_ROUTES.PLACE_BID}`;
            const response=await axiosInstance.post<bidResponseDTO,ApiResponse<placeBidDTO>>(url,{auctionId:auctionId,amount:amount,tenantId:tenantId});
            return{
                success:true,
                message:response.message,
                data:response.data
            }
        } catch (error) {
            return apiErrorHandler(error,'Failed to place bid')
        }
    }
    async pauseLive(auctionId:string){
        try {
            const url=`${BASE_ROUTES.LIVE}${LIVE_ROUTES.PAUSE_LIVE}`;
            const response=await axiosInstance.patch<LiveAuctionStateResponseDTO,ApiResponse<LiveAuctionStateResponseDTO>>(url,{auctionId:auctionId});
            return{
                success:true,
                message:response.message,
                data:response.data
            }
        } catch (error) {
            return apiErrorHandler(error,'Failed to pause auction')
        }
    }

}
export default new LiveService()