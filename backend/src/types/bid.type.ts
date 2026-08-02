import { Types,Document } from "mongoose";
import { BidStatus } from "../constants/constants";

export interface IBidDocument extends Document{
    tenantId:Types.ObjectId;
    auctionId:Types.ObjectId;
    bidderId:Types.ObjectId,
    bidAmount:number;
    status:BidStatus;
    createdAt:Date;
    updatedAt:Date;
}