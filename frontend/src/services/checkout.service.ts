import axiosInstance from "../api/axios.instance"
import { BASE_ROUTES, CHECKOUT_ROUTES } from "../constants/api.constant"
import type { ApiResponse } from "../types/auth.type"
import type { CheckoutDetailsResponseDTO } from "../types/chekout.dto"
import { apiErrorHandler } from "../utils/error.handle"


class CheckoutService {
    async getCheckoutDetails(id: string) {
        try {
            const url = `${BASE_ROUTES.CHECKOUT}${CHECKOUT_ROUTES.GET_CHECKOUT}/${id}`
            const response = await axiosInstance.get<CheckoutDetailsResponseDTO, ApiResponse<CheckoutDetailsResponseDTO>>(url)
            return {
                success: true,
                message: response.message,
                data: response.data
            }
        } catch (error) {
            return apiErrorHandler(error, 'Failed to checkout details')
        }
    }
}
export default new CheckoutService()