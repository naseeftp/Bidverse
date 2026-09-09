import { Types, Document } from "mongoose";
import { OrderStatus } from "../constants/order.constant";

export interface IOrderShippingSnapshot {
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

export interface IOrder {
    orderNumber: string;
    auctionItemId: Types.ObjectId;
    paymentRequestId: Types.ObjectId;
    paymentId: Types.ObjectId;
    tenantId: Types.ObjectId;
    buyerId: Types.ObjectId;

    addressId: Types.ObjectId;
    shippingSnapshot: IOrderShippingSnapshot;
    itemAmount: number;
    shippingCost: number;
    totalAmount: number;
    currency: string;

    status: OrderStatus;
    shippedAt?: Date;
    deliveredAt?: Date;

}

export type IOrderDocument = IOrder & Document