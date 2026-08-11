import axiosInstance from "../api/axios.instance";
import { BASE_ROUTES,PAYMENT_ROUTES } from "../constants/api.constant";
import type { ApiResponse } from "../types/auth.type";
import type{ verifyPaymentDTO } from "../types/payment.dto";
import { apiErrorHandler } from "../utils/error.handle";

export class PaymentService {
async verifyPayment(data:verifyPaymentDTO){
    try {
        const url=`${BASE_ROUTES.PAYMENT}${PAYMENT_ROUTES.VERIFY_PAYMENT}`;
        const response=await axiosInstance.patch<void,ApiResponse<void>>(url,data)
        return {
            success:true,
            message:response.message,
            data:response.data
        }
    } catch (error) {
        apiErrorHandler(error,'Failed to verify payment')
    }
}

}
export default new PaymentService()