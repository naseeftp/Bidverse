import axiosInstance from "../api/axios.instance";
import { ADMIN_ROUTES } from "../constants/api.constant";
import { apiErrorHandler } from "../utils/error.handle";
import type { ApiResponse } from "../types/auth.type";
import type { updateAuctionHouseStatusRequestDTO } from '../types/admin.dto'
import type { IPaginationMeta, UserResponseDTO } from "../types/auth.type";

class AdminService {
    async listAllAuctionHouses(page: number = 1, limit: number = 10) {
        try {
            const response = await axiosInstance.get<unknown, ApiResponse>(`${ADMIN_ROUTES.GET_AUCTION_HOUSES}?page=${page}&limit=${limit}`)
            return {
                success: true,
                message: response.message,
                ...(response.data || {})
            }
        } catch (error) {
            return apiErrorHandler(error, "Failed to fetch auction houses");
        }
    }
    async listAllusers(page: number = 1, limit: number = 10, search?: string, status?: string) {
        try {
            let url = `${ADMIN_ROUTES.GET_USERS}?page=${page}&limit=${limit}`
            if (search) {
                url += `&search=${encodeURIComponent(search)}`;
            }
            if (status && status != 'all') {
                url += `&status=${status}`
            }
            const response = await axiosInstance.get<
                UserResponseDTO,
                ApiResponse<{ data: UserResponseDTO[]; pagination: IPaginationMeta }>>(url);
            const paginatedResult = response.data
            return {
                success: true,
                message: response.message,
                data: paginatedResult?.data || [],
                pagination: paginatedResult?.pagination

            }
        } catch (error) {
            return apiErrorHandler(error, 'Failed to Fetch users')
        }
    }
    async getAuctionHouseById(id: string) {
        try {
            const url = `/admin/auction-house/${id}`;
            const response = await axiosInstance.get<unknown, ApiResponse>(url);
            return {
                success: true,
                message: response.message,
                data: response.data || response
            };
        } catch (error) {
            return apiErrorHandler(error, 'Failed to fetch house details');
        }

    }
    async getUserById(id:string){
        try {
            const url=`${ADMIN_ROUTES.GET_USER}/${id}`
            const  response=await axiosInstance.get<UserResponseDTO,ApiResponse<UserResponseDTO>>(url) // Slot 1: The type of 'data' inside ApiResponse Slot 2: The final return type of the axios call (unwrapped by interceptor)
              return {
                success:true,
                message:response.message,
                data:response.data
            }
        } catch (error) {
            return apiErrorHandler(error,'Failed To Fetch User Details')
        }
    }
    async updateHouseStatus(id: string, data: updateAuctionHouseStatusRequestDTO) {
        try {
            const url = `${ADMIN_ROUTES.UPDATE_HOUSE_STATUS}/${id}`;
            const response = await axiosInstance.patch<unknown, ApiResponse>(url, data);
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