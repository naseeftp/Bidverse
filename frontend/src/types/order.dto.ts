export const OrderStatus = {
    PENDING: "PENDING",
    PROCESSING: "PROCESSING",
    SHIPPED: "SHIPPED",
    OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
    DELIVERED: "DELIVERED",
    RETURN_REQUESTED: "RETURN_REQUESTED",
    COMPLETED: "COMPLETED",
    REFUNDED: "REFUNDED",
} as const;
export const ReturnRequestStatus = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
}
export const ReturnReason = {
    NOT_AS_DESCRIBED: "NOT_AS_DESCRIBED",
    DAMAGED: "DAMAGED",
    WRONG_ITEM: "WRONG_ITEM",
    AUTHENTICITY_ISSUE: "AUTHENTICITY_ISSUE",
    OTHER: "OTHER",
}
export type ReturnReason = typeof ReturnReason[keyof typeof ReturnReason]
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
export type ReturnRequestStatus = typeof ReturnRequestStatus[keyof typeof ReturnRequestStatus]


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

export interface OrderTenantListResponseDTO {
    id: string,
    orderNumber: string,
    auctionId: string,
    itemImage?: {
        url: string;
        altText?: string;
    } | null,
    itemTitle?: string,
    buyerName?: string,
    buyerId?: string,
    orderAmount: number,
    status: OrderStatus
}
export interface OrderAdminListResponseDTO {
    id: string,
    orderNumber: string,
    auctionId: string,
    itemImage?: {
        url: string;
        altText?: string;
    } | null,
    itemTitle?: string,
    buyerName?: string,
    buyerId?: string,
    houseName?: string,
    houseId?: string,
    orderAmount: number,
    status: OrderStatus
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
export interface IBuyerDTO {
    id: string;
    name: string;
    email?: string;
}
export interface IReturnRequestDTO {
    reason: ReturnReason;
    description: string;
    proofs: string[];
    status: ReturnRequestStatus;
    rejectionReason?: string;
    requestedAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
    reviewedByName?: string;
}

export interface OrderDetailsResponseDTO {
    id: string;
    orderNumber: string;
    status: string;
    createdAt: string;
    shippedAt?: string;
    deliveredAt?: string;
    item: IOrderItemDTO;
    shippingAddress: ShippingSnapshotDTO;
    financials: IOrderFinancialsDTO;
    payment?: IOrderPaymentDTO;
    seller?: IOrderSellerDTO;
    buyer?: IBuyerDTO,
    returnRequest?: IReturnRequestDTO;


}
export interface ReviewReturnRequestDTO {
    action: "approve" | "reject";
    rejectionReason?: string;
}