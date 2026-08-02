import { IBidDocument } from "../types/bid.type";
import { BidStatus, BidStatusValues } from "../constants/constants";
import mongoose,{Schema, Types} from "mongoose";

const BidSchema=new Schema<IBidDocument>({
    tenantId:{
        type:Types.ObjectId,
        ref:'AuctionHouse',
        required:true
    },
    auctionId:{
        type:Types.ObjectId,
        ref:'AuctionItem',
        required:true
    },
    bidderId:{
        type:Types.ObjectId,
        ref:'User',
        required:true,
    },
    bidAmount:{
        type:Number,
        required:true,
        min:0
    },
    status:{
        type:String,
        enum:BidStatusValues,
        default:BidStatus.ACTIVE
    },
    createdAt:{
        type:Date
    },
    updatedAt:{
        type:Date
    }
},{timestamps:true})

export const Bid=mongoose.model<IBidDocument>('Bid',BidSchema)