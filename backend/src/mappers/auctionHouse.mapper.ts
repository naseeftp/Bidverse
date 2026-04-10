import { IAuctionHouseDocument } from "../types/auctionhouse.type";
import { AuctionHouseResponseDTO } from "../dtos/auctionHouse.dto/auctionHouse.dto";

export class AuctionHouseMapper{
    static toResponseDTO(doc:IAuctionHouseDocument):AuctionHouseResponseDTO{
        return{
            id:doc._id.toString(),
            userId:doc.userId.toString(),
            name:doc.name,
            yearEstablished:doc.yearEstablished,
            briefDescription:doc.briefDescription,
            address:{
               city:doc.address.city,
               state:doc.address.state,
               country:doc.address.country,
               fullAddress:doc.address.fullAddress 
            },
            contact:{
                primaryContactName:doc.contact.primaryContactName,
                businessEmail:doc.contact.businessEmail,
                phone:doc.contact.phone
            },
            documents:{
             registrationCertificateUrl:doc.legal.registrationCertificateUrl,
             identityProofUrl:doc.legal.registrationCertificateUrl
            },
            status:doc.status,
            isVerified:doc.isVerified,
            createdAt:doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString()
        }
    }
}