import axiosInstance from "../api/axios.instance";
import { BASE_ROUTES, BID_ROUTES } from "../constants/api.constant";
import type { ApiResponse, IPaginationMeta } from "../types/auth.type";
import type { bidHistoryDTO, bidResponseDTO,myBidListDTO,placeBidDTO } from "../types/bid.dto";
import { apiErrorHandler } from "../utils/error.handle";

export class BidService{
    async placeBid(data:placeBidDTO){
      try {
        const url=`${BASE_ROUTES.BID}${BID_ROUTES.PLACE_BID}`;
        const response=await axiosInstance.post<bidResponseDTO,ApiResponse<bidResponseDTO>>(url,data);
        return{
            success:true,
            message:response.message,
            data:response.data
        }
      } catch (error) {
        apiErrorHandler(error,'error while placing bid')
      }
    }
    async getUserBids(page:number,limit:number,status?:string,search?:string){
      try {
        let url=`${BASE_ROUTES.BID}${BID_ROUTES.MY_BIDS}?page=${page}&limit=${limit}`;
        if(status) url+=`&status=${encodeURIComponent(status)}`
        if(search) url+=`&search=${encodeURIComponent(search)}`
        const response=await axiosInstance.get<myBidListDTO,ApiResponse<{data:myBidListDTO[],pagination:IPaginationMeta}>>(url)
        const paginatedResult=response.data;
        return{
          success:true,
          message:response.message,
          data:paginatedResult?.data,
          pagination:paginatedResult?.pagination
        }
        } catch (error) {
        return apiErrorHandler(error,'Failed to get User Bids')
      }
    }
    async getBidHistory(auctionId:string,page:number,limit:number){
      try {
        const url=`${BASE_ROUTES.BID}${BID_ROUTES.BID_HISTORY}/${auctionId}?page=${page}&limit=${limit}`;
        const response=await axiosInstance.get<bidHistoryDTO,ApiResponse<{data:bidHistoryDTO[],pagination:IPaginationMeta}>>(url)
        const paginatedResult=response.data;
        return{
          success:true,
          message:response.message,
          data:paginatedResult?.data,
          pagination:paginatedResult?.pagination
        }

      } catch (error) {
       return apiErrorHandler(error,'Failed to get BidHistory')
      }
    }

}
export default new BidService()