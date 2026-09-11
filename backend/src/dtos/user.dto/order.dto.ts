import { OrderStatus } from "../../constants/order.constant";

export interface CreateOrderDTO {
    paymentRequestId: string;
    addressId: string;
}

export interface CreateOrderInputDTO {
    orderNumber: string;
    auctionItemId: string;
    paymentRequestId: string;
    paymentId: string
    tenantId: string;
    buyerId: string;
    addressId: string;
    shippingSnapshot: {
        recipientName: string;
        phone: string;
        altPhone?: string;
        fullAddress: string;
        pincode: string;
        landMark?: string;
        city: string;
        state: string;
        country: string;
    };
    itemAmount: number;
    shippingCost: number;
    totalAmount: number;
    currency: string;
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

export interface OrderResponseDTO {
    id: string;
    orderNumber: string;
    auctionItemId: string;
    paymentRequestId: string;
    tenantId: string;
    buyerId: string;
    addressId: string;
    shippingSnapshot: ShippingSnapshotDTO;
    itemAmount: number;
    shippingCost: number;
    totalAmount: number;
    currency: string;
    status: OrderStatus;
    shippedAt?: Date;
    deliveredAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface OrderListResponseDTO{
    id:string,
    orderNumber:string,
    auctionId:string,
    itemImage?:string,
    itemTitle?:string,
    orderAmount:number,
    status:OrderStatus
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