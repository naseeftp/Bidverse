import { PaymentRequestStatus } from "../../types/paymentRequest.types";

export interface CreatePaymentRequestDTO {
  tenantId: string;
  auctionId: string;
  bidderId: string;
  amount: number;
  currency?: string;
  expiresAt: Date;
}

export interface PaymentRequestResponseDTO {
  id: string;
  auctionId: string;
  auctionTitle?: string;
  auctionImage?: string;
  amount: number;
  currency: string;
  status: PaymentRequestStatus;
  expiresAt: string;
  orderId?: string;
  createdAt: string;
}