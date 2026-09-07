import { PaymentRequestResponseDTO } from "../../dtos/user.dto/paymentRequest.dto";
import { IGenericPaginatedResposnse } from "../../types/response.type";

export interface IPaymentRequestService {
    createPaymentRequest(auctionId: string): Promise<PaymentRequestResponseDTO>
    getUserPaymentRequests(userId: string, page: number, limit: number, status?: string): Promise<IGenericPaginatedResposnse<PaymentRequestResponseDTO>>
}