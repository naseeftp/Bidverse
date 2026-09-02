import { Document, Types } from "mongoose";
import { LiveAuctionStatus } from "../constants/constants";

export interface ILiveAuctionStateDocument extends Document {
    auctionItemId: Types.ObjectId,
    status: LiveAuctionStatus,
    startBy: Types.ObjectId,
    startedAt?: Date,
    pausedAt?: Date;
    endedAt?: Date;
    totalPauseDuration: number,
    currentRound: Number,
    roundEndsAt:Date
}