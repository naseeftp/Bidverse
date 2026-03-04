import mongoose, { Document, QueryFilter, UpdateQuery, DeleteResult, Types } from "mongoose";



export interface IBaseRepository<T extends Document> {
    create(data: Partial<T>): Promise<T>;
    findAll(filter?: QueryFilter<T>): Promise<T[]>;
    findOne(filter?: QueryFilter<T>): Promise<T | null>;
    findById(id: string | Types.ObjectId): Promise<T | null>
    updateById(id: string | Types.ObjectId, data: UpdateQuery<T>): Promise<T | null>
    deleteById(id: string | Types.ObjectId): Promise<T | null>
    deleteByFilter(filter: QueryFilter<T>): Promise<DeleteResult>;
    count(filter?: QueryFilter<T>): Promise<number>

}


