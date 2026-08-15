import { EscrowStatusValues, PaymentStatusValues, PaymentTypeValues } from "../constants/payment.constants";
import { IPaymentDocument } from "../types/payment.type";
import mongoose, { Schema, Types } from "mongoose";

const PaymentSchema = new Schema<IPaymentDocument>({
    userId: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    auctionItemId: {
        type: Types.ObjectId,
        ref: "AuctionItem",
    },
    auctionHouseId: {
        type: Types.ObjectId,
        ref: 'AuctionHouse',
    },
    slotBookingId: {
        type: Types.ObjectId,
        ref: 'Slot',
    },
    type: {
        type: String,
        enum: PaymentTypeValues,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: "INR",
        required: true
    },
    status: {
        type: String,
        enum: PaymentStatusValues,
        required: true
    },
    escrowStatus:{
    type:String,
    enum:EscrowStatusValues,
    required:true
    },
    razorpayOrderId: {
        type: String,
        required: true,
        unique: true

    },
    razorpayPaymentId: {
        type: String,
        index: true
    },

    razorpaySignature: {
        type: String
    },

    paidAt: {
        type: Date
    },
    refundedAt: {
        type: Date
    },
    platformCommission: {
        type: Number
    },
    netAmount: {
        type: Number,
    },
    platformCommision:{
        type:Number
    },
    releasedAt: {
        type: Date
    }

})

export const Payment = mongoose.model<IPaymentDocument>('Payment', PaymentSchema)