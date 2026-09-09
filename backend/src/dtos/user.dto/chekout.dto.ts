import { AddressResponseDTO } from "./address.dto";

export interface AuctionItemSummaryDTO {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    currency: string;
}
export interface PaymentRequestSummaryDTO {
    id: string;
    amount: number;
    status: string;
    dueDate?: Date;
}
export interface PricingBreakdownDTO {
    itemAmount: number;
    shippingCost: number;
    totalAmount: number;
    currency: string;
}
export interface CheckoutDetailsResponseDTO {
    paymentRequest: PaymentRequestSummaryDTO;
    auctionItem: AuctionItemSummaryDTO;
    tenantId: string;
    addresses: AddressResponseDTO[];
    pricing: PricingBreakdownDTO;
}