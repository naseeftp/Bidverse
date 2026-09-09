import { CheckoutDetailsResponseDTO } from "../../dtos/user.dto/chekout.dto";


export interface ICheckoutService {
    getCheckoutDetails(paymentRequestId: string, buyerId: string): Promise<CheckoutDetailsResponseDTO>
}