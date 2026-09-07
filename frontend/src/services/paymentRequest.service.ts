import axiosInstance from "../api/axios.instance";
import { BASE_ROUTES,PAYMENT_REQUEST_ROUTES } from "../constants/api.constant";
import type { ApiResponse, IPaginationMeta } from "../types/auth.type";
import type { PaymentRequestResponseDTO } from "../types/paymentRequest.dto";
import { apiErrorHandler } from "../utils/error.handle";

export class PaymentRequestService{
    async listPaymentRequests(page:number,limit:number,status?:string){
        try {
            let url=`${BASE_ROUTES.PAYMENT_REQUEST}${PAYMENT_REQUEST_ROUTES.LIST_REQUEST}?page=${page}&limit=${limit}`
            if(status&&status!='all'){
                url+=`&status=${status}`
            }
           const response=await axiosInstance.get<PaymentRequestResponseDTO,ApiResponse<{data:PaymentRequestResponseDTO[],pagination:IPaginationMeta}>>(url)
           const paginatedResult=response.data;
           return{
            success:true,
            message:response.message,
            data:paginatedResult?.data,
            pagination:paginatedResult?.pagination
           }
        } catch (error) {
            return apiErrorHandler(error,'Failed to list payment Requests')
        }
    }
}

export default new PaymentRequestService()
