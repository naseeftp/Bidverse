import axiosInstance from "../api/axios.instance";
import { BASE_ROUTES, PUBLIC_ROUTES } from "../constants/api.constant";
import { apiErrorHandler } from "../utils/error.handle";
import type { ApiResponse, PublicAuctionHouseResponseDTO } from "../types/auth.type";
import type { IPaginationMeta } from "../types/auth.type";
import type { AuctionItemDetailDTO, AuctionItemListDTO } from "../types/auctionItem.dto";
import type{ PublicAuctionHouseDetailDTO } from "../types/auctionHouse.type";



class PublicAuctionService {
    async listAllPublicAuctionHouses(page: number = 1, limit: number = 10, search?: string, category?: string) {
        try {
            let url = `${BASE_ROUTES.PUBLIC}${PUBLIC_ROUTES.AUCTION_HOUSES}?page=${page}&limit=${limit}`
            if (search) {
                url += `&search=${encodeURIComponent(search)}`
            }
            if (category&&category!='all') {
                url += `&category=${encodeURIComponent(category)}`
            }
            const response = await axiosInstance.get<PublicAuctionHouseResponseDTO, ApiResponse<{ data: PublicAuctionHouseResponseDTO[], pagination: IPaginationMeta }>>(url)
            const paginatedResult = await response.data;
            return {
                success: true,
                message: response.message,
                data: paginatedResult?.data || [],
                pagination: paginatedResult?.pagination

            }

        } catch (error) {
            return apiErrorHandler(error, "Failed to fetch auction houses");
        }
    }
    async listPublicAuction(page:number,limit:number,search?:string,type?:string){
        try {
            let url=`${BASE_ROUTES.PUBLIC}${PUBLIC_ROUTES.AUCTIONS}?page=${page}&limit=${limit}`;
            if(search){
                url+=`&search=${encodeURIComponent(search)}`
            }
            if(type&&type!='all'){
                url+=`&type=${encodeURIComponent(type)}`
            }
            const response=await axiosInstance.get<AuctionItemListDTO,ApiResponse<{data:AuctionItemListDTO[],pagination:IPaginationMeta}>>(url);
            const paginatedResult=response.data
            return {
                success:true,
                message:response.message,
                data:paginatedResult?.data||[],
                pagination:paginatedResult?.pagination
            }
        } catch (error) {
        return apiErrorHandler(error, "Failed to fetch auctions");

        }

     }
    async getAuctionDetails(itemId:string){
         try {
            const url=`${BASE_ROUTES.PUBLIC}${PUBLIC_ROUTES.GET_AUCTION}/${itemId}`
            const response=await axiosInstance.get<AuctionItemDetailDTO,ApiResponse<AuctionItemDetailDTO>>(url)
            return{
                success:true,
                message:response.message,
                data:response.data
            }
         } catch (error) {
         return apiErrorHandler(error,'Failed to get Auctuion')

         }   
    }

    async getHouseDetailsWithAuctions(houseId:string,page:number,limit:number,search?:string,status?:string){
        try {
            let url=`${BASE_ROUTES.PUBLIC}${PUBLIC_ROUTES.AUCTION_HOUSE}/${houseId}?page=${page}&limit=${limit}`
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (status) url += `&status=${encodeURIComponent(status)}`;
            
            const response=await axiosInstance.get<PublicAuctionHouseDetailDTO,ApiResponse<{data:PublicAuctionHouseDetailDTO[],pagination:IPaginationMeta}>>(url)
            const paginatedResult=response.data;
            return{
                success:true,
                message:response.message,
                data:paginatedResult?.data,
                pagination:paginatedResult?.pagination
            }
        } catch (error) {
            return apiErrorHandler(error,'Failed to get AuctuionHouse Details')
        }
    }

}
export default new PublicAuctionService()