import { ISlotService } from "../interface/ISlot.service";
import { ISlotRepository } from "../../repositories/interfaces/ISlot.repository";
import { bookSlotDTO, bookSlotResponseDTO } from "../../dtos/user.dto/slot.dto";
import { IAuctionHouseRepository } from "../../repositories/interfaces/IAuctionHouse.repository";
import { IAuctionItemRepository } from "../../repositories/interfaces/IAuctionItem.repository";
import { NotFoundError } from "../../errors/AppError";
import { MESSAGES } from "../../constants/constants";
import { Types } from "mongoose";
import { SlotBookingStatus } from "../../constants/slot.constant";
import { SlotMapper } from "../../mappers/slot..mapper";

export class SlotService implements ISlotService {
    constructor(
        private _slotRepo: ISlotRepository,
        private _auctionHouse: IAuctionHouseRepository,
        private _auctionItemRepo: IAuctionItemRepository
    ) { }
    async bookSlot(userId: string, data: bookSlotDTO): Promise<bookSlotResponseDTO> {
        const auctionExist = await this._auctionItemRepo.findById(data.auctionId)
        if (!auctionExist) {
            throw new NotFoundError(MESSAGES.AUCTION_NOT_FOUND)
        }
        const bookedSlot = await this._slotRepo.create({
        userId:new Types.ObjectId(userId),
        auctionId:new Types.ObjectId(data.auctionId),
        tenantId:new Types.ObjectId(data.tenantId),
        status:SlotBookingStatus.CONFIRMED,
        startTime:auctionExist.startTime,
        endTime:auctionExist.endTime,
        })
        return SlotMapper.toBookSloTResponseDTO(bookedSlot)
    }
}