import { IOrderDocument } from "../types/order.type";
import { OrderStatus,ReturnReason,ReturnRequestStatus } from "../constants/order.constant";
import mongoose, { Schema, Types } from "mongoose";

const ShippingSnapshotSchema = new Schema(
    {
        recipientName: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        altPhone: { type: String, trim: true },
        fullAddress: { type: String, required: true, trim: true },
        pincode: { type: String, required: true, trim: true },
        landMark: { type: String, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        country: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const ReturnRequestSchema = new Schema(
    {
        reason: {
            type: String,
            enum: Object.values(ReturnReason),
            required: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        proofs: {
            type: [String],
            required: true,
        },

        status: {
            type: String,
            enum: Object.values(ReturnRequestStatus),
            default: ReturnRequestStatus.PENDING
        },

        rejectionReason: {
            type: String,
            trim: true
        },

        requestedAt: {
            type: Date,
            default: Date.now
        },

        reviewedAt: {
            type: Date
        },

        reviewedBy: {
            type: Types.ObjectId,
            ref: "User"
        }
    },
    { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    auctionItemId: {
        type: Types.ObjectId,
        ref: 'AuctionItem',
        required: true,
        index: true
    },
    paymentRequestId: {
        type: Types.ObjectId,
        ref: 'PaymentRequest',
        required: true
    },
    paymentId: {
        type: Types.ObjectId,
        ref: 'Payment'
    },
    tenantId:
    {
        type: Types.ObjectId,
        ref: "AuctionHouse", required: true,
        index: true
    },
    buyerId: {
        type: Types.ObjectId,
        ref: "User", required: true,
        index: true
    },
    addressId: {
        type: Types.ObjectId,
        ref: "Address",
        required: true
    },
    shippingSnapshot: {
        type: ShippingSnapshotSchema,
        required: true
    },
    itemAmount: {
        type: Number, required: true
    },
    shippingCost: {
        type: Number,
        required: true,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true,
        default: "INR"
    },
    status: {
        type: String,
        enum: Object.values(OrderStatus),
        default: OrderStatus.PENDING,
        index: true
    },
    shippedAt: {
        type: Date,
    },
    deliveredAt: {
        type: Date
    },
    confirmedAt:{
        type:Date
    },
    returnRequest:{
        type:ReturnRequestSchema
    }

}, { timestamps: true })
export const Order = mongoose.model<IOrderDocument>('Order', OrderSchema)