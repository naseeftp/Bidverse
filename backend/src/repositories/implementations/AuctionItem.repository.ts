import { IAuctionItemDocument } from "../../types/auctionItem.type";
import { IAuctionItemRepository } from "../interfaces/IAuctionItem.repository";
import { BaseRepository } from "./Base.repository";
import {AuctionItem} from '../../models/auctionItem.model'

export class AuctionItemRepository extends BaseRepository<IAuctionItemDocument> implements IAuctionItemRepository{
constructor(){
    super(AuctionItem)
}


}