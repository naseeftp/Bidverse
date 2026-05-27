import {CreateAuctionItemDTO,AuctionItemResponseDTO} from '../../dtos/auctionHouse.dto/auctionItem.dto'
import { IGenericPaginatedResposnse } from '../../types/response.type'
import { AuctionItemListDTO } from '../../dtos/auctionHouse.dto/auctionItem.dto'
export interface IAuctionItemMangementSevice{
    createAuction(userId:string,data:CreateAuctionItemDTO):Promise<AuctionItemResponseDTO>
    listAdminAuctions(page:number,limit:number,search?:string):Promise<IGenericPaginatedResposnse<AuctionItemListDTO>>

}