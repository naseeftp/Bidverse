import mongoose, { Schema } from "mongoose";
import { IWatchListDocument } from "../types/watchlist.type";

const WatchListSchema = new Schema<IWatchListDocument>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true,
        required: true
    },
    itemId: {
        type: Schema.Types.ObjectId,
        ref: 'AuctionItem',
        required: true,
    }
}, { timestamps: true })

export const Watchlist = mongoose.model<IWatchListDocument>('Watchlist', WatchListSchema)