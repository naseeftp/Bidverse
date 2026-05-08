import axiosInstance from "../api/axios.instance";
import type { addAddressDTO, AddressResponseDTO } from "../types/address.dto";
import { BASE_ROUTES, ADDRESS_ROUTES } from "../constants/api.constant";
import { apiErrorHandler } from "../utils/error.handle";
import type { ApiResponse } from "../types/auth.type";

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

}

export default new AddressService()