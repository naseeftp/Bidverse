import axiosInstance from "../api/axios.instance";
import { BASE_ROUTES, PUBLIC_ROUTES } from "../constants/api.constant";
import { apiErrorHandler } from "../utils/error.handle";
import type { ApiResponse, PublicAuctionHouseResponseDTO } from "../types/auth.type";
import type { IPaginationMeta } from "../types/auth.type";


class PublicAuctionService {
    async listAllPublicAuctionHouses(page: number = 1, limit: number = 10, search?: string) {
        try {
            let url=`${BASE_ROUTES.PUBLIC}${PUBLIC_ROUTES.AUCTION_HOUSES}?page=${page}&limit=${limit}`
            if(search){
            url+=`&search=${search}`
           }
           const response=await axiosInstance.get<PublicAuctionHouseResponseDTO,ApiResponse<{data:PublicAuctionHouseResponseDTO[],pagination:IPaginationMeta}>>(url)
           const paginatedResult=await response.data;
           return{
            success:true,
            message:response.message,
            data:paginatedResult?.data||[],
            pagination:paginatedResult?.pagination
            
           }

        } catch (error) {
           return apiErrorHandler(error, "Failed to fetch auction houses");
        }
    }

}
export default new PublicAuctionService()