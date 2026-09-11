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

export interface OrderTenantListResponseDTO{
    id:string,
    orderNumber:string,
    auctionId:string,
    itemImage?: {
        url: string;
        altText?: string;
    } | null,
    itemTitle?:string,
    buyerName?:string,
    buyerId?:string,
    orderAmount:number,
    status:OrderStatus
}

export interface ShippingSnapshotDTO {
    recipientName: string;
    phone: string;
    altPhone?: string;
    fullAddress: string;
    pincode: string;
    landMark?: string;
    city: string;
    state: string;
    country: string;
}
export interface IOrderItemDTO {
    id: string;
    title: string;
    imageUrl: string | null;
}
export interface IOrderFinancialsDTO {
    itemAmount: number;
    shippingCost: number;
    totalAmount: number;
    currency: string;
}

export interface IOrderPaymentDTO {
    paymentId: string;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    status: string;
    escrowStatus: string;
    type: string;
    paidAt?: string;
}
export interface IOrderSellerDTO {
    id: string;
    name: string;
    email?: string;
}
export interface OrderDetailsResponseDTO {
    id: string;
    orderNumber: string;
    status: string;
    createdAt: string;
    shippedAt?: string;
    deliveredAt?: string;
    item: IOrderItemDTO;
    shippingAddress:ShippingSnapshotDTO;
    financials: IOrderFinancialsDTO;
    payment?: IOrderPaymentDTO;
    seller?: IOrderSellerDTO;
}