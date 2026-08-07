import mongoose, { Schema, Types } from "mongoose";
import { IAuctionItemDocument } from "../types/auctionItem.type";
import { AuctionItemStatus, AuctionItemStatusValues, AuctionTypeValues } from "../constants/constants";


const AuctionItemSchema = new Schema<IAuctionItemDocument>({
    houseId: {
        type: Schema.Types.ObjectId,
        ref: 'AuctionHouse',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: AuctionItemStatusValues,
        default: AuctionItemStatus.DRAFT,
        required: true
    },
    type: {
        type: String,
        enum: AuctionTypeValues,
        required: true
    },
    totalSlots: {
        type: Number,
        min: 1,
    },
    slotFee: {
        type: Number,
        min: 0,
      
    },
    images: [
        {
            id: {
                type: String, required: true, trim: true
            },
            url: {
                type: String, required: true, trim: true
            },
            isPrimary: {
                type: Boolean, default: false
            },
            altText: {
                type: String, trim: true
            }
        }
    ],
    currency: {
        type: String,
        enum: ['INR'],
        default: 'INR',
        required: true
    },
    startingPrice: {
        type: Number,
        required: true,
        min: 0
    },
    reservePrice: {
        type: Number,
        required: true,
        min: 0
    },
    currentHighestBid: {
        type: Number,
        default: 0,
        min: 0
    },
    minimumIncrement: {
        type: Number,
        required: true,
        min: 1
    },
    buyerPremiumPercent: {
        type: Number,
        default: 0,
        min: 0
    },
    currentHighestBidder: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    winningBidder: {
        type: Types.ObjectId,
        ref: 'User'
    },
    reserveMet: {
    type: Boolean,
    default: false
    },
    bidCount:{
        type:Number,
        default:0
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    snipingProtectionMinutes: {
        type: Number,
        default: 0,
        min: 0
    },
    isApproved: {
        type: Boolean,
        default: false,
        required: true
    },
    approvedAt: {
        type: Date
    },
    rejectionReason: {
        type: String,
        trim: true
    },
    cancellation: {
        cancelledBy: {
            type: String,
            enum: ['HOUSE', 'ADMIN']
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: {
            type: String,
            trim: true,
        },
        cancelledAt: {
            type: Date
        }
    },
    shippingCost: {
        type: Number,
        default: 0,
        min: 0,
    },
    shippingTerms: {
        type: String,
        required: true,
        trim: true
    }



}, { timestamps: true })

AuctionItemSchema.index({ isApproved: 1, status: 1, startTime: 1 })
AuctionItemSchema.index({ status: 1, endTime: 1 })

export const AuctionItem = mongoose.model<IAuctionItemDocument>('AuctionItem', AuctionItemSchema)