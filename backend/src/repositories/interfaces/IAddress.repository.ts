import { IBaseRepository } from "./IBase.repository";
import { IAddressDocument } from "../../types/address.type";
import { Types } from "mongoose";

export interface IAddressRepository extends IBaseRepository<IAddressDocument>{
    countByUserId(userId:string):Promise<number>
    unsetDefaults(userId:string|Types.ObjectId):Promise<void>
    findAllUserAddress(userId:string|Types.ObjectId,page:number,limit:number):Promise<{docs:IAddressDocument[],total:number}>
    findDuplicate(userId:string|Types.ObjectId,fullAddress:string,city:string,pincode:string):Promise<IAddressDocument|null>
}