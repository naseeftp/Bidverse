import axiosInstance from "../api/axios.instance";
import { BASE_ROUTES, TRANSACTION_ROUTES } from "../constants/api.constant"
import type { ApiResponse, IPaginationMeta } from "../types/auth.type";
import type { transactionListDTO } from "../types/transaction.dto";
import { apiErrorHandler } from "../utils/error.handle"

export class TransactionService{
async listTransaction(page:number,limit:number){
    try {
        const url=`${BASE_ROUTES.TRANSACTION}${TRANSACTION_ROUTES.LIST_TRANSACTIONS}?page=${page}&limit=${limit}`;
        const response=await axiosInstance.get<transactionListDTO,ApiResponse<{data:transactionListDTO[],pagination:IPaginationMeta}>>(url);
        const paginatedResult=response.data;
        return{
            success:true,
            message:response.message,
            data:paginatedResult?.data,
            pagination:paginatedResult?.pagination
        }
    } catch (error) {
        return apiErrorHandler(error,'Failed to list transactions')
    }
}

}
export default new TransactionService()