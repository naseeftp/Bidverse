import { Types,Document } from "mongoose";

export enum PaymentRequestStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
}

export interface IPaymentRequest {
  tenantId: Types.ObjectId;
  auctionId: Types.ObjectId;
  bidderId: Types.ObjectId;
  winningBidId: Types.ObjectId;
  amount: number;
  currency: string;
  status: PaymentRequestStatus;
  expiresAt: Date;
  orderId?: Types.ObjectId;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
export type IPaymentRequestDocument=IPaymentRequest&Document;