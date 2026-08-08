import { Document,Types } from "mongoose";
import { SlotBookingStatus } from "../constants/slot.constant";
SlotBookingStatus

export interface ISlot{
userId:Types.ObjectId;
auctionId:Types.ObjectId;
tenantId:Types.ObjectId;
paymentId:Types.ObjectId;
status:SlotBookingStatus;
startTime:Date;
endTime:Date;
createdAt:Date,
updatedAt:Date;
}

export type ISlotDocument=ISlot&Document