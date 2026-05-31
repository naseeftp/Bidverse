import { IAuctionItemMangementSevice } from "../interface/IAuctionItemMangement.service";
import { ILoggerService } from "../interface/ILogger.service";
import { IAuctionItemRepository } from "../../repositories/interfaces/IAuctionItem.repository";
import { CreateAuctionItemDTO, AuctionItemResponseDTO, AuctionItemListDTO, AuctionItemDetailDTO } from "../../dtos/auctionHouse.dto/auctionItem.dto";
import { IAuctionHouseRepository } from "../../repositories/interfaces/IAuctionHouse.repository";
import { ForbiddenError, NotFoundError } from "../../errors/AppError";
import { AuctionItemStatus, MESSAGES } from "../../constants/constants";
import { IAuctionItem } from "../../types/auctionItem.type";
import { AuctionItemMapper } from "../../mappers/auctionItem.mapper";
import { IGenericPaginatedResposnse } from "../../types/response.type";

export class AuctionItemMangementSevice implements IAuctionItemMangementSevice{
    constructor(
        private _auctionItemRepo:IAuctionItemRepository,
        private _auctionHouseRepo:IAuctionHouseRepository,
        private _logger:ILoggerService
    ){}

    async createAuction(userId: string, data: CreateAuctionItemDTO): Promise<AuctionItemResponseDTO> {
        this._logger.info('auction item creation requested',{houseowner:userId})
        const houseExist=await this._auctionHouseRepo.findOne({userId:userId});
        this._logger.info('auction house exist',{house:houseExist})
        if(!houseExist){
            throw new NotFoundError(MESSAGES.AUCTION_HOUSE_NOT_FOUND)
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
       const hydratedObject = createdItem.toObject ? createdItem.toObject() : createdItem;
       return AuctionItemMapper.toResponseDTO(hydratedObject)
    }
    async listAdminAuctions(page: number, limit: number, search?: string,status?:string,type?:string): Promise<IGenericPaginatedResposnse<AuctionItemListDTO>> {
        const {auctions,total}=await this._auctionItemRepo.listAllAuctionItems(page,limit,search,status,type)
        return{
            data:auctions,
            pagination:{
                totalItems:total,
                itemsPerPage:limit,
                currentPage:page,
                totalPages:Math.ceil(total/limit),
                hasNextPage:page*limit<total,
                hasPrevPage:page>1
            }
        }
    }
    async listTenantAuctions(page:number,limit:number,search?:string,status?:string,type?:string, userId?: string): Promise<IGenericPaginatedResposnse<AuctionItemListDTO>> {
        const house=await this._auctionHouseRepo.findOne({userId:userId});
        if(!house){
            throw new NotFoundError(MESSAGES.AUCTION_HOUSE_NOT_FOUND)
        };
        const houseId=house._id as unknown as string;
        const {auctions,total}=await this._auctionItemRepo.listAllAuctionItems(page,limit,search,status,type,houseId)
          return{
            data:auctions,
            pagination:{
                totalItems:total,
                itemsPerPage:limit,
                currentPage:page,
                totalPages:Math.ceil(total/limit),
                hasNextPage:page*limit<total,
                hasPrevPage:page>1
            }
        }
    }
    async getAuctionDetails(itemId: string): Promise<AuctionItemDetailDTO | null> {
        const auction=await this._auctionItemRepo.findById(itemId);
        if(!auction){
            throw new NotFoundError(MESSAGES.AUCTION_NOT_FOUND)
        }
        const result=await this._auctionItemRepo.getAuctionItemDetails(itemId);
        return result
    }
}
