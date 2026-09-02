import { Types } from "mongoose";
import { LiveAuctionStateResponseDTO } from "../../dtos/auctionHouse.dto/live.auction.dto";
import { ILiveAuctionStateRepository } from "../../repositories/interfaces/ILiveAuctionStateRepository";
import { ILiveAcutionStateService } from "../interface/ILiveAuctionSate.service";
import { LiveStateMapper } from "../../mappers/liveState.mapper";
import { NotFoundError, UnauthorizedError } from "../../errors/AppError";
import { LiveAuctionStatus, MESSAGES } from "../../constants/constants";
import { AuctionItemDetailDTO} from "../../dtos/auctionHouse.dto/auctionItem.dto";
import { ISlotRepository } from "../../repositories/interfaces/ISlot.repository";
import { IAuctionItemRepository } from "../../repositories/interfaces/IAuctionItem.repository";
import { socketService } from "./socket.service";
import { INotificationService } from "../interface/INotification.service";
import { Role } from "../../dtos/Common.dto";
import { NotificationEvent, NotificationType } from "../../constants/notification.constant";

export class LiveAuctionStateService implements ILiveAcutionStateService {
    constructor(
        private _liveStateRepo: ILiveAuctionStateRepository,
        private _slotRepo: ISlotRepository,
        private _auctionRepo: IAuctionItemRepository,
        private _notificationService:INotificationService

    ) { }

    async findLiveState(auctionId: string): Promise<LiveAuctionStateResponseDTO> {
        const result = await this._liveStateRepo.findOne({ auctionItemId: new Types.ObjectId(auctionId) })
        if (!result) {
            throw new NotFoundError(MESSAGES.LIVE_STATE_NOT_FOUND)
        }
        return LiveStateMapper.toLiveStateResponseDTO(result)
    }
    async joinRoom(userId: string, auctionId: string): Promise<AuctionItemDetailDTO> {
        const userSlot = await this._slotRepo.findOne({ auctionId: new Types.ObjectId(auctionId), userId: new Types.ObjectId(userId) })
        if (!userSlot) {
            throw new NotFoundError(MESSAGES.SLOT_NOT_FOUND)
        };
        if (userId !== userSlot.userId.toString()) {
            throw new UnauthorizedError(MESSAGES.NOT_PERMITTED)
        }
        const auction = await this._auctionRepo.getAuctionItemDetails(userSlot.auctionId.toString());
        if (!auction) {
            throw new NotFoundError(MESSAGES.AUCTION_NOT_FOUND)
        }
        return auction
    }
    async startLive(startedBy: string, auctionId: string): Promise<LiveAuctionStateResponseDTO> {
        const liveExist = await this._liveStateRepo.findOne({ auctionItemId: new Types.ObjectId(auctionId) });
        if (!liveExist) {
            throw new NotFoundError(MESSAGES.LIVE_STATE_NOT_FOUND)
        }
        const auctionExist=await this._auctionRepo.findById(auctionId)
        const updatedLive = await this._liveStateRepo.updateById(liveExist._id, {
            startBy: new Types.ObjectId(startedBy),
            startedAt: new Date(),
            status: LiveAuctionStatus.LIVE
        })
        if (!updatedLive) {
            throw new NotFoundError(MESSAGES.LIVE_STATE_NOT_FOUND)
        }
        const responseDTO= LiveStateMapper.toLiveStateResponseDTO(updatedLive)
        socketService.emitToAuctionRoom(auctionId,'auction:started',{
            auctionItemId:auctionId,
            startedAt:new Date().toISOString()
        })
        const validSlotOwners=await this._slotRepo.validSlotOwnerForAuction(auctionId)
         await Promise.all([
            validSlotOwners.map(async (receiverId)=>{
                await this._notificationService.createAndSendNotification({
                    recipientId:receiverId,
                    recipientRole:Role.USER,
                    type:NotificationType.WARNING,
                    event:NotificationEvent.AUCTION_STARTED,
                    title:'Live Auction Strated',
                    message:`The Live Auction for ${auctionExist?.title} just Started Join Fast to dont Miss the Chance to Particiipate`
                })
            })
         ])
        return responseDTO
    }
}