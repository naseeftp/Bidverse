import { Document, Types } from "mongoose";

export interface IWatchList {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    itemId: Types.ObjectId;
    createdAt: Date;
}
export type IWatchListDocument = IWatchList & Document




