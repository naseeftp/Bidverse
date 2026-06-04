import { PublicAuctionHouseResponseDTO } from "../../dtos/Common.dto";
import { IGenericPaginatedResposnse } from "../../types/response.type";
import { AuctionItemDetailDTO, AuctionItemListDTO } from "../../dtos/auctionHouse.dto/auctionItem.dto";

export interface IPublicAunctionService{ 
 listAllPublicAuctionHouses(page:number,limit:number,search:string,category?:string):Promise<IGenericPaginatedResposnse<PublicAuctionHouseResponseDTO>>
 listPublicAuctions(page: number, limit: number, search?: string,type?: string):Promise<IGenericPaginatedResposnse<AuctionItemListDTO>>
 getAuctionDetail(itemId:string):Promise<AuctionItemDetailDTO|null>
}