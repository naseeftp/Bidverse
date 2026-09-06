import { PaymentRequestResponseDTO } from "../../dtos/user.dto/paymentRequest.dto";

export interface IPaymentRequestService{
    createPaymentRequest(auctionId:string):Promise<PaymentRequestResponseDTO>
}