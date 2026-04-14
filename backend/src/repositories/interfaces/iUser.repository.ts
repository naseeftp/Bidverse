import { IBaseRepository } from "./IBase.repository";
import { IUserDocument } from "../../types/user.type";

export interface IUserRepository extends IBaseRepository<IUserDocument> {
    findByEmail(email: string): Promise<IUserDocument | null>
    findByPhone(phone: string): Promise<IUserDocument | null>
    createOAuthUser(data: Partial<IUserDocument>): Promise<IUserDocument>;
}