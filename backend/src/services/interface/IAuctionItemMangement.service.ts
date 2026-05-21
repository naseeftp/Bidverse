import {CreateAuctionItemDTO,AuctionItemResponseDTO} from '../../dtos/auctionHouse.dto/auctionItem.dto'

export interface IAuctionItemMangementSevice{
    createAuction(userId:string,data:CreateAuctionItemDTO):Promise<AuctionItemResponseDTO>
}