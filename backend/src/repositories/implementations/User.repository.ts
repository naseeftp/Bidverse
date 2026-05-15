import { IUserRepository } from "../interfaces/iUser.repository";
import { BaseRepository } from "./Base.repository";
import { IUserDocument } from '../../types/user.type'
import UserModel from '../../models/user.model'
import { QueryFilter } from "mongoose";
import { SortOrder } from "mongoose";



export class UserRepository extends BaseRepository<IUserDocument> implements IUserRepository {
    constructor() {
        super(UserModel)
    }
    async findByEmail(email: string): Promise<IUserDocument | null> {
        return this.model.findOne({ email })
    }
    async findByPhone(phone: string): Promise<IUserDocument | null> {
        return this.model.findOne({ phone })
    }
    async createOAuthUser(data: Partial<IUserDocument>): Promise<IUserDocument> {
        return await this.model.create({
            ...data,
            isActive: true,

        });
    }
    async findAllPaginatedUsers(page: number, limit: number, filter?: QueryFilter<IUserDocument>, sort?: Record<string, SortOrder>): Promise<{ docs: IUserDocument[]; total: number; }> {
        const skip = (page - 1) * limit;
        const [docs, total] = await Promise.all([
            this.model.find(filter).sort(sort).skip(skip).limit(limit).exec(),
            this.model.countDocuments(filter)
        ])
        return { docs, total }
    }
  
    
}
