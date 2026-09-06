import { IPaymentRequestDocument } from "../types/paymentRequest.types";
import { PaymentRequestResponseDTO } from "../dtos/user.dto/paymentRequest.dto";

export class PaymentRequestMapper{
    static toPaymentRequestResponseDTO(entity: IPaymentRequestDocument,
    auctionMeta?: { title: string; image?: string }):PaymentRequestResponseDTO{
     return{
        id:entity._id.toString(),
        auctionId:entity.auctionId.toString(),
        auctionTitle:auctionMeta?.title,
        auctionImage:auctionMeta?.image,
        amount:entity.amount,
        currency:entity.currency,
        status:entity.status,
        expiresAt:entity.expiresAt.toISOString(),
        orderId:entity.orderId?entity.orderId?.toString():undefined,
        createdAt:entity.createdAt.toISOString()
     }
    }
}