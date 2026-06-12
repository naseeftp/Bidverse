import axiosInstance from "../api/axios.instance";
import { BASE_ROUTES,WATCH_LIST_ROUTES } from "../constants/api.constant";
import type { ApiResponse, IPaginationMeta } from "../types/auth.type";
import type{ WatchListAddOrDeleteResponseDTO,WatchlistItemCardDTO} from "../types/watchlist.dto";
import { apiErrorHandler } from "../utils/error.handle";

class watchlistService{
    async addToWatchList(itemId:string){
        try {
            const url=`${BASE_ROUTES.WATCH_LIST}${WATCH_LIST_ROUTES.ADD_TO_WATCH_LIST}`
            const response=await axiosInstance.post<WatchListAddOrDeleteResponseDTO,ApiResponse<WatchListAddOrDeleteResponseDTO>>(url,{itemId})
            return {
                success:true,
                message:response.message,
                data:response.data
            }
        } catch (error) {
            return apiErrorHandler(error,'Failed to add item to Watchlist')
        }
    }
   async findAllWatchListItems(page:number,limit:number){
    try {
        const url=`${BASE_ROUTES.WATCH_LIST}${WATCH_LIST_ROUTES.MY_WATH_LIST}?page=${page}&limit=${limit}`;
        const response=await axiosInstance.get<WatchlistItemCardDTO,ApiResponse<{items:WatchlistItemCardDTO[];pagination:IPaginationMeta}>>(url)
        const paginatedResult=response.data;
        return{
            success:true,
            message:response.message,
            data:paginatedResult?.items,
            pagination:paginatedResult?.pagination
        }
    } catch (error) {
      return apiErrorHandler(error,'Failed to to Watchlist')
    }
   }

}

export default new watchlistService()