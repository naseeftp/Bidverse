import { Types, Document } from "mongoose";
import { PaymentType, PaymentStatus, EscrowStatus } from "../constants/payment.constants";

export interface IOrderPaymentMetadata {
    paymentRequestId: string;
    addressId: string;
    tenantId: string;
}

export interface IPayment {
    userId: Types.ObjectId;
    auctionItemId?: Types.ObjectId;
    auctionHouseId?: Types.ObjectId;
    slotBookingId?: Types.ObjectId;
    type: PaymentType;
    amount: number;
    currency: string;
    status: PaymentStatus;
    escrowStatus?: EscrowStatus
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    paidAt?: Date;
    refundedAt?: Date;
    platformCommission?: number;
    netAmount?: number;
    platformCommision?: number;
    releasedAt?: Date;
    metadata?: IOrderPaymentMetadata;
}
export type IPaymentDocument = IPayment & Document;