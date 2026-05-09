import { BaseRepository } from "./Base.repository";
import { IAddressDocument } from "../../types/address.type";
import { IAddressRepository } from "../interfaces/IAddress.repository";
import { Address } from "../../models/address.model";
import { Types } from "mongoose";

export class AddressRepository extends BaseRepository<IAddressDocument> implements IAddressRepository {
   constructor() {
      super(Address)
   }
   private escapeRegex(text: string): string {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
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
            $set: { isDefault: false }
         }
      )
   }
   async findAllUserAddress(userId: string | Types.ObjectId, page: number, limit: number): Promise<{ docs: IAddressDocument[], total: number }> {
      const skip = (page - 1) * limit;
      const filter = {
         userId: userId,
         isActive: true
      }
      const [docs, total] = await Promise.all([
         this.model.find(filter).
            sort({ isDefault: -1, createdAt: -1 }).
            skip(skip).limit(limit).exec(),

         this.model.countDocuments(filter)

      ])
      return { docs, total }
   }

   async findDuplicate(userId: string | Types.ObjectId, fullAddress: string,city: string, pincode: string): Promise<IAddressDocument | null> {
      const normalizedfullAddress = fullAddress.trim();
      const normalizedPincode = pincode.trim();
      const normalizedCity = city.trim();
      return await this.model.findOne({
         userId: userId,
         isActive: true,
         city: normalizedCity,
         pincode: normalizedPincode,
         fullAddress:{
            $regex:new RegExp(`^${this.escapeRegex(normalizedfullAddress)}$`,'i')
         }

      }).exec()
   }
}