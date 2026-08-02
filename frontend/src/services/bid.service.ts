import axiosInstance from "../api/axios.instance";
import { BASE_ROUTES, BID_ROUTES } from "../constants/api.constant";
import type { ApiResponse } from "../types/auth.type";
import type { bidResponseDTO,placeBidDTO } from "../types/bid.dto";
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

}
export default new BidService()