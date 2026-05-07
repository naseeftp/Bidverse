import { Document,Types } from "mongoose";
import { AddressLabel } from "../constants/constants";

export interface IAddress{
    _id:Types.ObjectId;
    userId:Types.ObjectId;
    label:AddressLabel;
    recipientName:string;
    phone:string;
    altPhone?:string;
    fullAddress:string;
    pincode:string;
    landMark?:string;
    city:string;
    state:string;
    country:string;
    isActive:boolean;
    isDefault:boolean;
    createdAt:Date;
    updatedAt:Date;
}

export type IAddressDocument=IAddress&Document