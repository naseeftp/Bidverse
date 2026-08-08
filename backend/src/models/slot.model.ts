import mongoose, { Schema, Types } from "mongoose";
import { ISlotDocument } from "../types/slot.type";
import { SlotBookingStatus, SlotBookingStatusValues } from "../constants/slot.constant";

const SlotSchema = new Schema<ISlotDocument>({
    userId: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    auctionId: {
        type: Types.ObjectId,
        ref: 'AuctionItem',
        required: true,
    },
    tenantId: {
        type: Types.ObjectId,
        ref: 'AuctionHouse',
        required: true,
    },
    paymentId:{
        type:Types.ObjectId,
        ref:'Payment'
    },
    status: {
        type: String,
        enum: SlotBookingStatusValues,
        default: SlotBookingStatus.PENDING
    },
    startTime: {
        type: Date,
    },
    endTime: {
        type: Date
    },
    createdAt: {
        type: Date,
    },
    updatedAt: {
        type: Date
    }

}, { timestamps: true })

export const Slot=mongoose.model<ISlotDocument>('Slot',SlotSchema)