import axiosInstance from "../api/axios.instance";
import { ADMIN_ROUTES } from "../constants/api.constant";
import { apiErrorHandler } from "../utils/error.handle";
import type { ApiResponse } from "../types/auth.type";
import type {updateAuctionHouseStatusRequestDTO} from '../types/admin.dto'

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
    async getAuctionHouseById(id: string) {
    try {
        const url = `/admin/auction-house/${id}`;
        const response = await axiosInstance.get<any,ApiResponse>(url);
        return {
            success: true,
            message: response.message,
            data: response.data||response
        }; 
    } catch (error) {
        return apiErrorHandler(error, 'Failed to fetch house details');
    }
    
}

async updateHouseStatus(id: string, data: updateAuctionHouseStatusRequestDTO) {
    try {
        const url = `${ADMIN_ROUTES.UPDATE_HOUSE_STATUS}/${id}`;  
        const response = await axiosInstance.patch<any, ApiResponse>(url, data);
        return {
            success: true,
            message: response.message || "Status updated successfully",
            data: response.data
        };
    } catch (error) {
        return apiErrorHandler(error, 'Failed to update status');
    }
}
}
export default new AdminService();