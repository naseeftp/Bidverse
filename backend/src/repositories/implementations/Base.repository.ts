import mongoose, { Document, Model, QueryFilter, UpdateQuery, DeleteResult } from "mongoose";
import { IBaseRepository } from "../interfaces/IBase.repository";


export class BaseRepository<T extends Document> implements IBaseRepository<T> {
    protected model: Model<T>;//any class extended from this class can use the variable
    constructor(model: Model<T>) {
        this.model = model;
    }
    async create(data: Partial<T>): Promise<T> {
        return await this.model.create(data)
    }
    async findAll(filter?: mongoose.QueryFilter<T> | undefined): Promise<T[]> {
        return await this.model.find(filter)
    }
    async findOne(filter?: mongoose.QueryFilter<T> | undefined): Promise<T | null> {
        return await this.model.findOne(filter)
    }
    async findById(id: string | mongoose.Types.ObjectId): Promise<T | null> {
        return await this.model.findById(id)
    }
    async updateById(id: string | mongoose.Types.ObjectId, data: mongoose.UpdateQuery<T>): Promise<T | null> {
        return await this.model.findByIdAndUpdate(id, data, { new: true })
    }
    async deleteById(id: string | mongoose.Types.ObjectId): Promise<T | null> {
        return await this.model.findByIdAndDelete(id)
    }
    async deleteByFilter(filter: mongoose.QueryFilter<T>): Promise<DeleteResult> {
        return await this.model.deleteMany(filter)
    }
    async findOneByField(fieldName: string, value: unknown): Promise<T | null> {
        return await this.model.findOne({ [fieldName]: value }).exec();
    }
    async updateByFilter(filter: mongoose.QueryFilter<T>, data: mongoose.UpdateQuery<T>): Promise<T | null> {
        return await this.model.findOneAndUpdate(filter, data, { new: true }).exec()
    }
    async count(filter?: mongoose.QueryFilter<T> | undefined): Promise<number> {
        return await this.model.countDocuments(filter)
    }

}