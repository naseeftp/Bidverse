import { WatchListAddOrDeleteResponseDTO, WatchlistItemCardDTO } from "../../dtos/user.dto/watchlist.dto";
import { IGenericPaginatedResposnse } from "../../types/response.type";

export interface IWatchListService {
  addToWatchList(userId: string, itemId: string): Promise<WatchListAddOrDeleteResponseDTO>
  findAllWatchListItems(page: number, limit: number, userId: string): Promise<IGenericPaginatedResposnse<WatchlistItemCardDTO>>
}