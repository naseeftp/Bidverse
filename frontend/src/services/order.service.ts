import axiosInstance from "../api/axios.instance";
import { BASE_ROUTES, ORDER_ROUTES } from "../constants/api.constant";
import type { ApiResponse, IPaginationMeta } from "../types/auth.type";
import type { CreateOrderDTO, OrderDetailsResponseDTO, OrderListResponseDTO } from "../types/order.dto";
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
async getMyOrders(page:number,limit:number,status?:string,search?:string){
    try {
       let url=`${BASE_ROUTES.ORDER}${ORDER_ROUTES.GET_MY_ORDERS}?page=${page}&limit=${limit}` 
       if(status&&status!=='ALL'){
         url+=`&status=${status}`
       }
       if(search&&search.trim()!==''){
        url+=`&search=${search}`
       }
       const response=await axiosInstance.get<OrderListResponseDTO,ApiResponse<{data:OrderListResponseDTO[],pagination:IPaginationMeta}>>(url)
       const paginatedResult=response.data;
       return {
        success:true,
        message:response.message,
        data:paginatedResult?.data,
        pagination:paginatedResult?.pagination
       }
    } catch (error) {
        return apiErrorHandler(error,'Failed to list orders')
    }
}
async getOrderDetails(id:string){
    try {
        const url=`${BASE_ROUTES.ORDER}${ORDER_ROUTES.ORDER_DEATAILS}/${id}`;
        const response=await axiosInstance.get<OrderDetailsResponseDTO,ApiResponse<OrderDetailsResponseDTO>>(url)
        return{
            success:true,
            message:response.message,
            data:response.data
        }
    } catch (error) {
        return apiErrorHandler(error,'Failed to get order details')
    }
}
}
export default new OrderService()