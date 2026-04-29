import { IBaseRepository } from "./IBase.repository";
import { IUserDocument } from "../../types/user.type";
import type { QueryFilter, SortOrder } from "mongoose";

export interface IUserRepository extends IBaseRepository<IUserDocument> {
    findByEmail(email: string): Promise<IUserDocument | null>
    findByPhone(phone: string): Promise<IUserDocument | null>
    createOAuthUser(data: Partial<IUserDocument>): Promise<IUserDocument>;

    findAllPaginatedUsers(
        page: number,
        limit: number,
        filter?: QueryFilter<IUserDocument>,
        sort?: Record<string, SortOrder>
    ): Promise<{ docs: IUserDocument[]; total: number }>;
}