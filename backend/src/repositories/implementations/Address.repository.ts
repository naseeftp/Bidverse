import { BaseRepository } from "./Base.repository";
import { IAddressDocument } from "../../types/address.type";
import { IAddressRepository } from "../interfaces/IAddress.repository";
import { Address } from "../../models/address.model";
import { Types } from "mongoose";
export class AddressRepository extends BaseRepository<IAddressDocument> implements IAddressRepository {
   constructor() {
      super(Address)
   }

   async countByUserId(userId: string): Promise<number> {
      return await this.model.countDocuments({
         userId: userId,
         isActive: true
      })
   }
   async unsetDefaults(userId: string | Types.ObjectId): Promise<void> {
      await this.model.updateMany(
         {
            userId: userId,
            isDefault: true
         },
         {
           $set:{isDefault:false}
         }
      )
   }
}