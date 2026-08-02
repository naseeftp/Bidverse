import { IBidService } from "../interface/IBid.service";
import { IBidRepository } from "../../repositories/interfaces/IBid.repository";
import { bidResponseDTO, placeBidDTO } from "../../dtos/user.dto/bid.dto";
import { IUserRepository } from "../../repositories/interfaces/iUser.repository";
import { NotFoundError } from "../../errors/AppError";
import { MESSAGES } from "../../constants/constants";
import { IAuctionItemRepository } from "../../repositories/interfaces/IAuctionItem.repository";
import { Types } from "mongoose";
import { BidMapper } from "../../mappers/bid.mapper";

export class BidService implements IBidService {
    constructor(
        private _bidRepo: IBidRepository,
        private _userRepo: IUserRepository,
        private _auctionRepo:IAuctionItemRepository
    ) { }
    async placceBid(userId: string, data: placeBidDTO): Promise<bidResponseDTO> {
        const userExist = await this._userRepo.findById(userId);
        if (!userExist){
            throw new NotFoundError(MESSAGES.USER_NOT_FOUND)
        }
        const auctionExist=await this._auctionRepo.findById(data.auctionId);
        if(!auctionExist){
            throw new NotFoundError(MESSAGES.AUCTION_NOT_FOUND)
        };
        const result=await this._bidRepo.create({
            tenantId:new Types.ObjectId(data.tenantId),
            bidAmount:Number(data.amount),
            auctionId:new Types.ObjectId(data.auctionId),
            bidderId:new Types.ObjectId(userId)
        })
        return BidMapper.toBidResponseDTO(result)
    }
}   