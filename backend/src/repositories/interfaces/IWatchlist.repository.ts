import { IBaseRepository } from "./IBase.repository";
import { IWatchListDocument } from "../../types/watchlist.type";
import {WatchlistItemCardDTO} from '../../dtos/user.dto/watchlist.dto'

export interface IWatchListRepository extends IBaseRepository<IWatchListDocument>{
    findAllWatchListItems(page:number,limit:number,userId:string):Promise<{items:WatchlistItemCardDTO[],total:number}>
}