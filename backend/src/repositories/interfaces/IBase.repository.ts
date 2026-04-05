import mongoose, { Document, QueryFilter, UpdateQuery, DeleteResult, Types } from "mongoose";



export interface IBaseRepository<T extends Document> {
    create(data: Partial<T>): Promise<T>;
    findAll(filter?: QueryFilter<T>): Promise<T[]>;
    findOne(filter?: QueryFilter<T>): Promise<T | null>;
    findById(id: string | Types.ObjectId): Promise<T | null>
    updateById(id: string | Types.ObjectId, data: UpdateQuery<T>): Promise<T | null>
    deleteById(id: string | Types.ObjectId): Promise<T | null>
    deleteByFilter(filter: QueryFilter<T>): Promise<DeleteResult>;
    findOneByField(fieldName:string,value:unknown):Promise<T|null>
    updateByFilter(filter:QueryFilter<T>,data:UpdateQuery<T>):Promise<T|null>
    count(filter?: QueryFilter<T>): Promise<number>

}


