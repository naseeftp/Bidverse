import { ISlotService } from "../interface/ISlot.service";
import { ISlotRepository } from "../../repositories/interfaces/ISlot.repository";
import { bookSlotDTO, bookSlotResponseDTO } from "../../dtos/user.dto/slot.dto";
import { IAuctionHouseRepository } from "../../repositories/interfaces/IAuctionHouse.repository";
import { IAuctionItemRepository } from "../../repositories/interfaces/IAuctionItem.repository";
import { NotFoundError } from "../../errors/AppError";
import { MESSAGES } from "../../constants/constants";
import { Types } from "mongoose";
import { SlotBookingStatus } from "../../constants/slot.constant";
// import { SlotMapper } from "../../mappers/slot..mapper";
import { IPaymentService } from "../interface/IPayment.service";
import { createSlotPaymentDTO } from "../../dtos/user.dto/payment.dto";

export class SlotService implements ISlotService {
    constructor(
        private _slotRepo: ISlotRepository,
        private _auctionHouse: IAuctionHouseRepository,
        private _auctionItemRepo: IAuctionItemRepository,
        private _paymentService:IPaymentService,
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
        status:SlotBookingStatus.PENDING,
        startTime:auctionExist.startTime,
        endTime:auctionExist.endTime,
        })
        auctionExist.slotCount+=1;
        await auctionExist.save();
        const paymentData:createSlotPaymentDTO={
            userId:userId,
            auctionId:data.auctionId,
            slotBookingId:bookedSlot._id.toString(),
            amount:auctionExist.slotFee!
        }
        const payment= await this._paymentService.createSlotPayment(paymentData)
        // return SlotMapper.toBookSloTResponseDTO(bookedSlot)
        return {
            slotId:bookedSlot._id.toString(),
            slotStatus:bookedSlot.status,
            slotOwnerId:bookedSlot.userId.toString(),
            payment:{
                paymentId:payment.paymentId.toString(),
                orderId:payment.orderId.toString(),
                amount:payment.amount,
                currency:payment.currency,
                keyId:process.env.RAZORPAY_KEY_ID!
            }
        }
    }
}