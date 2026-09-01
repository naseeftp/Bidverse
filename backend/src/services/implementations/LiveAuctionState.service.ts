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

export class LiveAuctionStateService implements ILiveAcutionStateService {
    constructor(
        private _liveStateRepo: ILiveAuctionStateRepository,
        private _slotRepo: ISlotRepository,
        private _auctionRepo: IAuctionItemRepository

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
       
        return responseDTO
    }
}