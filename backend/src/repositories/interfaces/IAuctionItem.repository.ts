import { IBaseRepository } from "./IBase.repository";
import { IAuctionItemDocument } from "../../types/auctionItem.type";

export interface IAuctionItemRepository extends IBaseRepository<IAuctionItemDocument>{
    
}