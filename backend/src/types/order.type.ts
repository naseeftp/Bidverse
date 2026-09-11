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
    createdAt: Date,
    updatedAt: Date,
}

export type IOrderDocument = IOrder & Document
export interface IOrderAggregateDOC extends IOrderDocument {
    auction?: {
        _id: string;
        title: string;
        images?: string[];
    };
}
export interface IOrderTenantAggregateDOC extends IOrderDocument{
    auction?: {
        _id: string;
        title: string;
        images?: string[];
    };
    buyer?:{
        _id:string;
        buyerName:string,
    }
}

export interface IOrderDetailsAggregateDoc {
    _id: Types.ObjectId;
    orderNumber: string;
    status: string;
    itemAmount: number;
    shippingCost: number;
    totalAmount: number;
    currency: string;
    createdAt: Date;
    shippedAt?: Date;
    deliveredAt?: Date;
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
    auction?: {
        _id: Types.ObjectId;
        title: string;
        images?: Array<{ url: string } | string>;
    };
    payment?: {
        _id: Types.ObjectId;
        razorpayOrderId: string;
        razorpayPaymentId?: string;
        status: string;
        escrowStatus: string;
        type: string;
        paidAt?: Date;
    };
    tenant?: {
        _id: Types.ObjectId;
        name: string;
        email?: string;
    };
}