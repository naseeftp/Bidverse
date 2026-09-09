import { Types, Document } from "mongoose";

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
export type IPaymentRequestDocument = IPaymentRequest & Document;

export interface IPaymentRequestAggregateDoc extends IPaymentRequestDocument {
  auction?: {
    _id: string;
    title: string;
    images?: string[];
  };
}

export interface IPopulatedAuctionItem {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  images?: Array<string | { url: string }>;
  currency?: string;
  startingPrice?: number;
  shippingCost?: number;
}

export type IPopulatedPaymentRequest = Omit<IPaymentRequestDocument, "auctionItemId"> & {
  auctionId: IPopulatedAuctionItem;
};