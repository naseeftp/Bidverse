import { IBaseRepository } from "./IBase.repository";
import { IAuctionItemDocument } from "../../types/auctionItem.type";
import { AuctionItemListDTO,AuctionItemDetailDTO} from "../../dtos/auctionHouse.dto/auctionItem.dto";

export interface IAuctionItemRepository extends IBaseRepository<IAuctionItemDocument>{
  listAllAuctionItems(page:number,limit:number,search?:string,status?:string|string[],type?:string,houseId?:string):Promise<{auctions:AuctionItemListDTO[],total:number}>
  getAuctionItemDetails(itemId:string):Promise<AuctionItemDetailDTO|null>;
}