import { BaseRepository } from "./Base.repository";
import { IWatchListRepository } from "../interfaces/IWatchlist.repository";
import { IWatchListDocument } from "../../types/watchlist.type";
import { Watchlist } from '../../models/watchlist.model'

export class WatchListRepository extends BaseRepository<IWatchListDocument> implements IWatchListRepository {
    constructor() {
        super(Watchlist)
    }

}