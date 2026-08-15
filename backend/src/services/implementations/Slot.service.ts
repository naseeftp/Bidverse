import { ISlotService } from "../interface/ISlot.service";
import { ISlotRepository } from "../../repositories/interfaces/ISlot.repository";
import { bookedSlotListDTO, bookSlotDTO, bookSlotResponseDTO, slotCancelDTO, slotCancelResponseDTO } from "../../dtos/user.dto/slot.dto";
import { IAuctionHouseRepository } from "../../repositories/interfaces/IAuctionHouse.repository";
import { IAuctionItemRepository } from "../../repositories/interfaces/IAuctionItem.repository";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../../errors/AppError";
import { MESSAGES } from "../../constants/constants";
import { Types } from "mongoose";
import { SlotBookingStatus } from "../../constants/slot.constant";
// import { SlotMapper } from "../../mappers/slot..mapper";
import { IPaymentService } from "../interface/IPayment.service";
import { createSlotPaymentDTO } from "../../dtos/user.dto/payment.dto";
import { IGenericPaginatedResposnse } from "../../types/response.type";
import { SlotMapper } from "../../mappers/slot..mapper";

export class SlotService implements ISlotService {
    constructor(
        private _slotRepo: ISlotRepository,
        private _auctionHouse: IAuctionHouseRepository,
        private _auctionItemRepo: IAuctionItemRepository,
        private _paymentService: IPaymentService,
    ) { }
    async bookSlot(userId: string, data: bookSlotDTO): Promise<bookSlotResponseDTO> {
        const auctionExist = await this._auctionItemRepo.findById(data.auctionId)
        if (!auctionExist) {
            throw new NotFoundError(MESSAGES.AUCTION_NOT_FOUND)
        }
        if (auctionExist.totalSlots && auctionExist.slotCount >= auctionExist.totalSlots) {
            throw new BadRequestError(MESSAGES.HOUSE_FULL)
        }
        const isAllReadyBooked = await this._slotRepo.findAllReadyBooked(userId, data.auctionId)
        if (isAllReadyBooked) {
            throw new BadRequestError(MESSAGES.ALLREADY_BOOKED)
        }
        const bookedSlot = await this._slotRepo.create({
            userId: new Types.ObjectId(userId),
            auctionId: new Types.ObjectId(data.auctionId),
            tenantId: new Types.ObjectId(data.tenantId),
            status: SlotBookingStatus.PENDING,
            startTime: auctionExist.startTime,
            endTime: auctionExist.endTime,
        })

        const paymentData: createSlotPaymentDTO = {
            userId: userId,
            auctionId: data.auctionId,
            slotBookingId: bookedSlot._id.toString(),
            amount: auctionExist.slotFee!
        }
        const payment = await this._paymentService.createSlotPayment(paymentData)
        // return SlotMapper.toBookSloTResponseDTO(bookedSlot)
        return {
            slotId: bookedSlot._id.toString(),
            slotStatus: bookedSlot.status,
            slotOwnerId: bookedSlot.userId.toString(),
            payment: {
                paymentId: payment.paymentId.toString(),
                orderId: payment.orderId.toString(),
                amount: payment.amount,
                currency: payment.currency,
                keyId: process.env.RAZORPAY_KEY_ID!
            }
        }
    }
    async listAllSlotForUser(userId: string, page: number, limit: number): Promise<IGenericPaginatedResposnse<bookedSlotListDTO>> {
        const { data, total } = await this._slotRepo.listAllSlotForUser(userId, page, limit);
        return {
            data: data,
            pagination: {
                totalItems: total,
                itemsPerPage: limit,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            }
        }
    }
    async cancellSlot(data: slotCancelDTO): Promise<slotCancelResponseDTO> {
        const slotExist=await this._slotRepo.findById(data.slotId)
        if(!slotExist){
            throw new NotFoundError(MESSAGES.SLOT_NOT_FOUND)
        }
        if(slotExist.userId.toString()!==data.userId){
            throw new UnauthorizedError(MESSAGES.NOT_PERMITTED)
        };
        const cancelledSlot=await this._slotRepo.updateById(data.slotId,

            {
                status:SlotBookingStatus.CANCELLED
            }
        )
        if(!cancelledSlot){
            throw new NotFoundError(MESSAGES.SLOT_NOT_FOUND)
        }
        return SlotMapper.toCancelSloTResponseDTO(cancelledSlot)
    }
}