import { CreatePaymentRequestDTO } from "../../dtos/user.dto/paymentRequest.dto";
import { IPaymentRequestDocument } from "../../types/paymentRequest.types";
import { IBaseRepository } from "./IBase.repository";

export interface IPaymentRequestRepository extends IBaseRepository<IPaymentRequestDocument>{
    createPaymentRequest(data:CreatePaymentRequestDTO):Promise<IPaymentRequestDocument>
    findByAuctionId(auctionId: string): Promise<IPaymentRequestDocument | null>;
    findByRequestId(id: string): Promise<IPaymentRequestDocument | null>;
    updateStatus(id: string, status: string, orderId?: string): Promise<IPaymentRequestDocument | null>;
}