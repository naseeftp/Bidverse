import { IPublicAunctionService } from "../interface/IPublicAuction.service";
import { IAuctionHouseRepository } from "../../repositories/interfaces/IAuctionHouse.repository";
import { ILoggerService } from "../interface/ILogger.service";
import { PublicAuctionHouseResponseDTO } from "../../dtos/Common.dto";
import { IGenericPaginatedResposnse } from "../../types/response.type";
import { AuctionItemStatus, MESSAGES } from "../../constants/constants";
import { IAuctionItemRepository } from "../../repositories/interfaces/IAuctionItem.repository";
import { AuctionItemListDTO,AuctionItemDetailDTO} from "../../dtos/auctionHouse.dto/auctionItem.dto";
import { NotFoundError } from "../../errors/AppError";
export class PublicAuctionService implements IPublicAunctionService{
    constructor(
        private _auctionHouseRepo:IAuctionHouseRepository,
        private _logger:ILoggerService,
        private _auctionItemRepo:IAuctionItemRepository
    ){}

    async  listAllPublicAuctionHouses(page: number, limit: number, search: string,category?:string): Promise<IGenericPaginatedResposnse<PublicAuctionHouseResponseDTO>> {
        
            const {houses,total}=await this._auctionHouseRepo.listPublicAuctionHouses(page,limit,search,category)
            return{
                data:houses,
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
    async listPublicAuctions(page: number, limit: number, search?: string, type?: string): Promise<IGenericPaginatedResposnse<AuctionItemListDTO>> {
            const publicStatus=[
                AuctionItemStatus.SCHEDULED,
                // AuctionItemStatus.PASSED,
                // AuctionItemStatus.SOLD
            ]
    
            const {auctions,total}=await this._auctionItemRepo.listAllAuctionItems(page,limit,search,publicStatus,type)
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
        async getAuctionDetail(itemId: string): Promise<AuctionItemDetailDTO|null> {
            const auction=await this._auctionItemRepo.findById(itemId)
            if(!auction){
                throw new NotFoundError(MESSAGES.AUCTION_NOT_FOUND)
            }
            const result=await this._auctionItemRepo.getAuctionItemDetails(itemId)
            return result
        }
}