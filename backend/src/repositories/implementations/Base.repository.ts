import mongoose, { Document, Model } from "mongoose";
import { Filter, UpdateFilter } from "mongodb";
import { IBaseRepository } from "../interfaces/IBase.repository";


export class BaseRepository<T extends Document> implements IBaseRepository<T> {
    protected model: Model<T>;
    constructor(model: Model<T>) {
        this.model = model;
    }

    async create(data: Partial<T>): Promise<T> {
        return await this.model.create(data)
    }

}