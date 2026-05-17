import { IPublicAunctionService } from "../interface/IPublicAuction.service";
import { IAuctionHouseRepository } from "../../repositories/interfaces/IAuctionHouse.repository";
import { ILoggerService } from "../interface/ILogger.service";
import { PublicAuctionHouseResponseDTO } from "../../dtos/Common.dto";
import { IGenericPaginatedResposnse } from "../../types/response.type";
import { AppError } from "../../errors/AppError";
import { MESSAGES } from "../../constants/constants";


export class PublicAuctionService implements IPublicAunctionService{
    constructor(
        private _auctionHouseRepo:IAuctionHouseRepository,
        private _logger:ILoggerService
    ){}

    async  listAllPublicAuctionHouses(page: number, limit: number, search: string): Promise<IGenericPaginatedResposnse<PublicAuctionHouseResponseDTO>> {
        
            const {houses,total}=await this._auctionHouseRepo.listPublicAuctionHouses(page,limit,search)
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
}