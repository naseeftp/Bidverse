import { IBaseRepository } from "./IBase.repository";
import {IUserDocument} from "../../types/user.type";

export interface IUserRepository extends IBaseRepository<IUserDocument>{
    findByEmail(email:string):Promise<IUserDocument|null>
}