import { Document,Types } from "mongoose";
import { VerificationStatus } from "../constants/constants";

export type TVerificationStatus=typeof VerificationStatus[keyof typeof VerificationStatus]

export interface IAuctionHouse{
    _id:Types.ObjectId;
    userId:Types.ObjectId;
    name:string;
    yearEstablished:number;
    briefDescription:string;
    address:{
        city:string;
        state:string;
        country:string;
        fullAddress:string;
    };
    contact:{
        primaryContactName:string;
        bussinessEmail:string;
        phone:string
    }
    legal:{
        registrationNumber:string;
        taxId:string;
        registrationCertificateUrl:string;
        identityProofUrl:string
    };
    status:TVerificationStatus;
    rejectionReason?:string;
    isVerified:boolean;
    createdAt?:Date;
    updatedAt?:Date;
}

export type IAuctionHouseDocument=IAuctionHouse&Document;
