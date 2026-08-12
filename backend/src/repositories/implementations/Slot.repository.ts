import { ISlotRepository } from "../interfaces/ISlot.repository";
import { Slot } from "../../models/slot.model";
import { ISlotDocument } from "../../types/slot.type";
import { BaseRepository } from "./Base.repository";
import { Types } from "mongoose";
import { SlotBookingStatus } from "../../constants/slot.constant";

export class SlotRepository extends BaseRepository<ISlotDocument> implements ISlotRepository{
    constructor(){
        super(Slot)
    }
    async findAllReadyBooked(userId:string,auctionId:string):Promise<ISlotDocument|null>{
        const result=await this.model.findOne(
            {
                userId:new Types.ObjectId(userId),
                auctionId:new Types.ObjectId(auctionId),
                status:{
                    $in:[
                        // SlotBookingStatus.PENDING, // later when retry payment use this
                        SlotBookingStatus.CONFIRMED
                    ]
                }
            }
        )
        return result
    }
    
}
