import mongoose,{Schema,Types} from "mongoose";
import { ILiveAuctionState } from "../types/liveAuction.type";
import { LiveAuctionStatus, LiveAuctionStatusValues } from "../constants/constants";

const LiveAuctionSchema=new Schema<ILiveAuctionState>({
auctionItemId:{
    type:Types.ObjectId,
    required:true,
    unique:true,
    index:true,
    ref:'AuctionItem'
},
status:{
    type:String,
    enum:LiveAuctionStatusValues,
    default:LiveAuctionStatus.WAITING,
    required:true,
},
startBy:{
    type:Types.ObjectId,
    ref:'User',
    required:true,
},
startedAt:{
    type:Date,
},
pausedAt:{
    type:Date
},
endedAt:{
    type:Date
},
totalPauseDuration:{
    type:Number,
    default:0,
    min:0
}
},{timestamps:true})

export const LiveAuctionSate=mongoose.model<ILiveAuctionState>('LiveAuctionState',LiveAuctionSchema)