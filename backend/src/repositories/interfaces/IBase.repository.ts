import mongoose, { Document } from "mongoose";
import { Filter, UpdateFilter } from "mongodb";

export interface IBaseRepository<T extends Document> {
    create(data: Partial<T>): Promise<T>;
    // findAll(filter: Filter<T>): Promise<T>;
    // findById(id: string | mongoose.Types.ObjectId): Promise<T | null>;
    // findOne(filter: Filter<T>): Promise<T | null>
    // update(filter: Filter<T>, update: UpdateFilter<T>): Promise<T | null>
    // delete(filter: Filter<T>): Promise<boolean>
}
