import { BaseRepository } from "./Base.repository";
import { IBidRepository } from "../interfaces/IBid.repository";
import { IBidDocument } from "../../types/bid.type";
import {Bid} from '../../models/bid.model'

export class BidRepository extends BaseRepository<IBidDocument> implements IBidRepository{
    constructor(){
        super(Bid)
    }
}