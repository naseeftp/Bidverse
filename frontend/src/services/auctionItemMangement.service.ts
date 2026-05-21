import axiosInstance from "../api/axios.instance";
import type{ AuctionItemResponseDTO,CreateAuctionItemDTO} from "../types/auctionItem.dto";
import { BASE_ROUTES,AUCTION_ITEM_ROUTES } from "../constants/api.constant";
import { apiErrorHandler } from "../utils/error.handle";
import type { ApiResponse } from "../types/auth.type";

class AuctionItemMangementService{
    async createAuctionItem(data:CreateAuctionItemDTO){
        try {
            const url=`${BASE_ROUTES.AUCTION_ITEM}${AUCTION_ITEM_ROUTES.CREATE}`
            const response=await axiosInstance.post<AuctionItemResponseDTO,ApiResponse<AuctionItemResponseDTO>>(url,data)
            return{
                success:true,
                message:response.message,
                data:response.data
            }
        } catch (error) {
            return apiErrorHandler(error, 'Failed to Create AuctionItem')
        }
    }
}
export default new AuctionItemMangementService()