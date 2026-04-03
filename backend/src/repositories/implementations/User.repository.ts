import { IUserRepository } from "../interfaces/iUser.repository";
import { BaseRepository } from "./Base.repository";
import { IUserDocument } from '../../types/user.type'
import UserModel from '../../models/user.model'

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
}
