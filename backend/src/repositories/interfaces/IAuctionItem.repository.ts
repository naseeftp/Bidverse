import { IBaseRepository } from "./IBase.repository";
import { IAuctionItemDocument } from "../../types/auctionItem.type";
import { AuctionItemListDTO } from "../../dtos/auctionHouse.dto/auctionItem.dto";

export interface IAuctionItemRepository extends IBaseRepository<IAuctionItemDocument>{
  listAllAuctionItems(page:number,limit:number,search?:string,status?:string,type?:string,houseId?:string):Promise<{auctions:AuctionItemListDTO[],total:number}>
}