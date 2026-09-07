export interface PaymentRequestResponseDTO {
  id: string;
  auctionId: string;
  auctionTitle?: string;
  auctionImage?: string;
  amount: number;
  currency: string;
  status: string;
  expiresAt: string;
  orderId?: string;
  createdAt: string;
}