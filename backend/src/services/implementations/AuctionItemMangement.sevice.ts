import { IAuctionItemMangementSevice } from "../interface/IAuctionItemMangement.service";
import { ILoggerService } from "../interface/ILogger.service";
import { IAuctionItemRepository } from "../../repositories/interfaces/IAuctionItem.repository";
import { CreateAuctionItemDTO, AuctionItemResponseDTO } from "../../dtos/auctionHouse.dto/auctionItem.dto";
import { IAuctionHouseRepository } from "../../repositories/interfaces/IAuctionHouse.repository";
import { ForbiddenError, NotFoundError } from "../../errors/AppError";
import { AuctionItemStatus, MESSAGES } from "../../constants/constants";
import { IAuctionItem } from "../../types/auctionItem.type";
import { AuctionItemMapper } from "../../mappers/auctionItem.mapper";

export class AuctionItemMangementSevice implements IAuctionItemMangementSevice{
    constructor(
        private _auctionItemRepo:IAuctionItemRepository,
        private _auctionHouseRepo:IAuctionHouseRepository,
        private _logger:ILoggerService
    ){}

    async createAuction(userId: string, data: CreateAuctionItemDTO): Promise<AuctionItemResponseDTO> {
        this._logger.info('auction item creation requested',{houseowner:userId})
        const houseExist=await this._auctionHouseRepo.findById(userId);
        this._logger.info('auction house exist',{house:houseExist})
        if(!houseExist){
            throw new NotFoundError(MESSAGES.USER_NOT_FOUND)
        }
        const houseId=houseExist._id;
        if(!houseExist.isVerified){
            throw new ForbiddenError(MESSAGES.NOT_PERMITTED)
        }
       const auctionItemData:Partial<IAuctionItem>={
        ...data,
        houseId:houseId,
        status:AuctionItemStatus.PENDING_APPROVAL,
        isApproved:false,
        currentHighestBid:0,
        images:data.images.map(img=>({
            id:img.id,
            url:img.url,
            isPrimary:img.isPrimary,
            altText:img.altText
        }))
       }
       const createdItem=await this._auctionItemRepo.create(auctionItemData)
       return AuctionItemMapper.toResponseDTO(createdItem)
    }
}
