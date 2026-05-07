import { AddressResponseDTO } from "../dtos/user.dto/address.dto";
import { IAddressDocument } from "../types/address.type";

export class AddressMapper{
    static toAddressDto(doc:IAddressDocument):AddressResponseDTO{
    return{
        id:doc._id.toString(),
        userId:doc.userId.toString(),
        label:doc.label,
        recipientName:doc.recipientName,
        phone:doc.phone,
        altPhone:doc.altPhone,
        fullAddress:doc.fullAddress,
        pincode:doc.pincode,
        landMark:doc.landMark,
        city:doc.city,
        state:doc.city,
        country:doc.country,
        isDefault:doc.isActive,
        isActive:doc.isActive,
        createdAt:doc.createdAt,
        updatedAt:doc.updatedAt
    }

    }
}