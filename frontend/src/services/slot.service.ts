import axiosInstance from "../api/axios.instance";
import { BASE_ROUTES,SLOT_ROUTES } from "../constants/api.constant";
import type { bookSlotDTO,bookSlotResponseDTO } from "../types/slot.dto";
import { apiErrorHandler } from "../utils/error.handle";
import type { ApiResponse } from "../types/auth.type";


export class SlotService{
    async bookSlot(data:bookSlotDTO){
        try {
            const url=`${BASE_ROUTES.SLOT}${SLOT_ROUTES.BOOK_SLOT}`;
            const response=await axiosInstance.post<bookSlotResponseDTO,ApiResponse<bookSlotResponseDTO>>(url,data)
            return{
                success:true,
                message:response.message,
                data:response.data
            }
        } catch (error) {
           return apiErrorHandler(error,'Failed to book slot')
        }
    }
}

export default new SlotService()