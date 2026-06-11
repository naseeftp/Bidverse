import {WatchListAddOrDeleteResponseDTO} from "../../dtos/user.dto/watchlist.dto";


export interface IWatchListService{
  addToWatchList(userId:string,itemId:string):Promise<WatchListAddOrDeleteResponseDTO>
}