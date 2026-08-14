import axiosInstance from "../api/axios.instance";
import { BASE_ROUTES, SLOT_ROUTES } from "../constants/api.constant";
import type { bookedSlotListDTO, bookSlotDTO, bookSlotResponseDTO } from "../types/slot.dto";
import { apiErrorHandler } from "../utils/error.handle";
import type { ApiResponse, IPaginationMeta } from "../types/auth.type";


export class SlotService {
    async bookSlot(data: bookSlotDTO) {
        try {
            const url = `${BASE_ROUTES.SLOT}${SLOT_ROUTES.BOOK_SLOT}`;
            const response = await axiosInstance.post<bookSlotResponseDTO, ApiResponse<bookSlotResponseDTO>>(url, data)
            return {
                success: true,
                message: response.message,
                data: response.data
            }
        } catch (error) {
            return apiErrorHandler(error, 'Failed to book slot')
        }
    }
    async listAllSlotForUser(page: number, limit: number) {
        try {
            const url = `${BASE_ROUTES.SLOT}${SLOT_ROUTES.MY_SLOTS}?page=${page}&limit=${limit}`
            const response = await axiosInstance.get<bookedSlotListDTO, ApiResponse<{ data: bookedSlotListDTO[], pagination: IPaginationMeta }>>(url)
            const paginatedResult = response.data;
            return {
                success: true,
                message: response.message,
                data: paginatedResult?.data,
                pagination: paginatedResult?.pagination
            }
        } catch (error) {
            return apiErrorHandler(error, 'Failed to slot list')
        }
    }
}

export default new SlotService()