import { WatchListRepository } from "../repositories/implementations/Watchlist.repository";
import { AuctionItemRepository } from "../repositories/implementations/AuctionItem.repository";
import { WatchListService } from "../services/implementations/Watchlist.service";
import { WatchListController } from "../controllers/implimentations/Watchlist.controller";

const watchlistRepo=new WatchListRepository()
const auctionItemRepo=new AuctionItemRepository()
const watchlistService=new WatchListService(watchlistRepo,auctionItemRepo)
export const watchlistController=new WatchListController(watchlistService)
