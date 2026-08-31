import { Types } from "mongoose";
import { LiveAuctionStateResponseDTO } from "../../dtos/auctionHouse.dto/live.auction.dto";
import { ILiveAuctionStateRepository } from "../../repositories/interfaces/ILiveAuctionStateRepository";
import { ILiveAcutionStateService } from "../interface/ILiveAuctionSate.service";
import { LiveStateMapper } from "../../mappers/liveState.mapper";
import { NotFoundError } from "../../errors/AppError";
import { MESSAGES } from "../../constants/constants";

export class LiveAuctionStateService implements ILiveAcutionStateService{
    constructor(
        private _liveStateRepo:ILiveAuctionStateRepository
    ){}

    async findLiveState(auctionId: string): Promise<LiveAuctionStateResponseDTO> {
        const result=await this._liveStateRepo.findOne({auctionItemId:new Types.ObjectId(auctionId)})
        if(!result){
            throw new NotFoundError(MESSAGES.LIVE_STATE_NOT_FOUND)
        }
        return LiveStateMapper.toLiveStateResponseDTO(result)
    }
}