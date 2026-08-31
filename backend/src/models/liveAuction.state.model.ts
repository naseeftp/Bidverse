import mongoose,{Schema,Types} from "mongoose";
import { ILiveAuctionStateDocument } from "../types/liveAuction.type";
import { LiveAuctionStatus, LiveAuctionStatusValues } from "../constants/constants";

const LiveAuctionSchema=new Schema<ILiveAuctionStateDocument>({
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

export const LiveAuctionState=mongoose.model<ILiveAuctionStateDocument>('LiveAuctionState',LiveAuctionSchema)