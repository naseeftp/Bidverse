import mongoose, { Schema, Types } from "mongoose";
import { ITransactionDocument } from "../types/transaction.type";
import { TransactionDirection, TransactionPartyType, TransactionPurpose, TransactionStatus } from "../constants/transaction.constant";


const TransactionSchema = new Schema<ITransactionDocument>({
    partyType: {
        type: String,
        enum: Object.values(TransactionPartyType),
        required: true
    },
    userId: {
        type: Types.ObjectId,
        ref: 'User'
    },
    auctionHouseId: {
        type: Types.ObjectId,
        ref: 'AuctionHouse'
    },
    paymentId: {
        type: Types.ObjectId,
        ref: 'Payment'
    },
    auctionItemId: {
        type: Types.ObjectId,
        ref: 'AuctionItem'
    },
    slotBookingId: {
        type: Types.ObjectId,
        ref: 'Slot'
    },
    purpose: {
        type: String,
        enum: Object.values(TransactionPurpose),
        required: true
    },
    direction: {
        type: String,
        enum: Object.values(TransactionDirection),
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    currency: {
        type: String,
        required: true,
        default: "INR",
        uppercase: true,
    },
    status:{
            type: String,
            enum: Object.values(TransactionStatus),
            required: true,
            default: TransactionStatus.PENDING 
    },
    description:{
         type: String,
            trim: true,
    },
    razorpayPaymentId:{
        type:String,
    },
    razorpayOrderId:{
        type:String
    },
    
},{timestamps:true})

export const Transaction=mongoose.model<ITransactionDocument>('Transaction',TransactionSchema)