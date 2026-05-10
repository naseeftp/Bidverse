import axiosInstance from "../api/axios.instance";
import type { addAddressDTO, AddressResponseDTO, deleteAddressDTO } from "../types/address.dto";
import { BASE_ROUTES, ADDRESS_ROUTES } from "../constants/api.constant";
import { apiErrorHandler } from "../utils/error.handle";
import type { ApiResponse } from "../types/auth.type";
import type { IPaginationMeta } from "../types/auth.type";

class AddressService {
    async addAddress(data: addAddressDTO) {
     try {
        const url=`${BASE_ROUTES.ADDRESS}${ADDRESS_ROUTES.ADD_ADDRESS}`
        const response=await axiosInstance.post<AddressResponseDTO,ApiResponse<AddressResponseDTO>>(url,data)
        return {
            success:true,
            message:response.message,
            data:response.data
        }
     } catch (error) {
      return apiErrorHandler(error, 'Failed to Add Address')
     }
    }
    async getUserAddressed(page:number=1,limit:number=10){
     try {
        const url=`${BASE_ROUTES.ADDRESS}${ADDRESS_ROUTES.GET_USER_ADDRESS}?page=${page}&limit=${limit}`
        const response=await axiosInstance.get<AddressResponseDTO,ApiResponse<{data:AddressResponseDTO[],pagination:IPaginationMeta}>>(url)
        const paginatedResult=response.data
        return{
            success:true,
            message:response.message,
            data:paginatedResult?.data||[],
            pagination:paginatedResult?.pagination
        }

     } catch (error) {
        return apiErrorHandler(error, 'Failed to Get Address')
     }
    }
    async deleteAddress(id:string,data:deleteAddressDTO){
       try {
        const url=`${BASE_ROUTES.ADDRESS}${ADDRESS_ROUTES.DELETE_ADDRESS}/${id}`
        const response=await axiosInstance.patch<AddressResponseDTO,ApiResponse<AddressResponseDTO>>(url,data)
        return{
            success:true,
            message:response.message,
            data:response.data
        }
       } catch (error) {
         return apiErrorHandler(error, 'Failed to delete Address')

       } 
    }
}

export default new AddressService()