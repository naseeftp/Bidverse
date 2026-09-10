import axiosInstance from "../api/axios.instance";
import { BASE_ROUTES, ORDER_ROUTES } from "../constants/api.constant";
import type { ApiResponse } from "../types/auth.type";
import type { CreateOrderDTO } from "../types/order.dto";
import type { OrderPaymentResponseDTO } from "../types/payment.dto";
import { apiErrorHandler } from "../utils/error.handle";

export class OrderService{
async placeOrder(data:CreateOrderDTO){
    try {
        const url=`${BASE_ROUTES.ORDER}${ORDER_ROUTES.PLACE_ORDER}`
        const response=await axiosInstance.post<OrderPaymentResponseDTO,ApiResponse<OrderPaymentResponseDTO>>(url,data);
        return{
            success:true,
            message:response.message,
            data:response.data
        }
    } catch (error) {
        return apiErrorHandler(error,'Failed to place order')
    }
}
}
export default new OrderService()