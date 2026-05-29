import axiosInstance from "../api/axios.instance";
import type{ AuctionItemResponseDTO,CreateAuctionItemDTO} from "../types/auctionItem.dto";
import { BASE_ROUTES,AUCTION_ITEM_ROUTES } from "../constants/api.constant";
import { apiErrorHandler } from "../utils/error.handle";
import type { ApiResponse, IPaginationMeta } from "../types/auth.type";
import type { AuctionItemListDTO } from "../types/auctionItem.dto";

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

    async listAdminAuctions(page:number,limit:number,search?:string,status?:string,type?:string){
        try {
            let url=`${BASE_ROUTES.AUCTION_ITEM}${AUCTION_ITEM_ROUTES.ADMIN_AUCTIONS}?page=${page}&limit=${limit}`
            if(search){
                url+=`&search=${encodeURIComponent(search)}`
            }
            if(status&&status!='all'){
                url+=`&status=${status}`
            }
            if(type&&type!='all'){
                url+=`&type=${type}`
            }
            const response=await axiosInstance.get<AuctionItemListDTO,ApiResponse<{data:AuctionItemListDTO[],pagination:IPaginationMeta}>>(url)
            const paginatedResult=response.data;
            return{
                success:true,
                message:response.message,
                data:paginatedResult?.data,
                pagination:paginatedResult?.pagination
            }
        } catch (error) {
            return apiErrorHandler(error,'Failed to get Auctuions')
        }
    }
}
export default new AuctionItemMangementService()