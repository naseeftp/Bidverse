import { ISlotRepository } from "../interfaces/ISlot.repository";
import { Slot } from "../../models/slot.model";
import { ISlotDocument } from "../../types/slot.type";
import { BaseRepository } from "./Base.repository";
import { Types } from "mongoose";
import { SlotBookingStatus } from "../../constants/slot.constant";
import { bookedSlotListDTO } from "../../dtos/user.dto/slot.dto";

export class SlotRepository extends BaseRepository<ISlotDocument> implements ISlotRepository {
    constructor() {
        super(Slot)
    }
    async findAllReadyBooked(userId: string, auctionId: string): Promise<ISlotDocument | null> {
        const result = await this.model.findOne(
            {
                userId: new Types.ObjectId(userId),
                auctionId: new Types.ObjectId(auctionId),
                status: {
                    $in: [
                        // SlotBookingStatus.PENDING, // later when retry payment use this
                        SlotBookingStatus.CONFIRMED
                    ]
                }
            }
        )
        return result
    }
    async listAllSlotForUser(userId: string, page: number, limit: number): Promise<{ data: bookedSlotListDTO[], total: number }> {
        const skip = (page - 1) * limit;
        const targetedUserId = new Types.ObjectId(userId);
        const [slots, total] = await Promise.all([
            this.model.find({ userId: targetedUserId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate<{
                    auctionId: {
                        _id: Types.ObjectId;
                        title: string;
                        images: {
                            url: string;
                            isPrimary: boolean;
                        }[];
                    };
                }>('auctionId', 'title images').lean(),

            this.model.countDocuments({ userId: targetedUserId })
        ])

        const data: bookedSlotListDTO[] = slots.map((slot) => {
            const auction = slot.auctionId;
            const primaryImage = auction.images?.find(
                (img) => img.isPrimary
            );
            return {
                slotId: slot._id.toString(),
                auctionId: auction._id.toString(),
                auctionTitle: auction.title,
                auctionImage: primaryImage?.url,
                startTime: slot.startTime,
                endTime: slot.endTime,
                status: slot.status,
                bookedAt: slot.createdAt
            }
        })
        return {
            data,
            total
        }

    }
    async validSlotOwnerForAuction(auctionId:string):Promise<Types.ObjectId[]>{
        return await this.model.distinct('userId',{
            auctionId:new Types.ObjectId(auctionId),
            status:SlotBookingStatus.CONFIRMED
        })
    }
    

}
