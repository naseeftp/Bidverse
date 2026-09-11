export const OrderStatus = {
    PENDING: "PENDING",
    PROCESSING: "PROCESSING",
    SHIPPED: "SHIPPED",
    OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
    DELIVERED: "DELIVERED",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
    REFUNDED: "REFUNDED",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface CreateOrderDTO {
    paymentRequestId: string;
    addressId: string;
}

export interface OrderListResponseDTO {
    id: string,
    orderNumber: string,
    auctionId: string,
    itemImage?: {
        url: string;
        altText?: string;
    } | null;
    itemTitle?: string,
    orderAmount: number,
    status: string,
}