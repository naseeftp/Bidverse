import axiosInstance from "../api/axios.instance";
import { ADMIN_ROUTES } from "../constants/api.constant";
import { apiErrorHandler } from "../utils/error.handle";
import type { ApiResponse } from "../types/auth.type";

class AdminService{
    async listAllAuctionHouses(page: number = 1, limit: number = 10){
        try {
            const response=await axiosInstance.get<any,ApiResponse>(`${ADMIN_ROUTES.GET_AUCTION_HOUSES}?page=${page}&limit=${limit}`)
            return{
                success:true,
                message:response.message,
                ...response.data
            }
        } catch (error) {
            return apiErrorHandler(error, "Failed to fetch auction houses");
        }
    }
}
export default new AdminService();