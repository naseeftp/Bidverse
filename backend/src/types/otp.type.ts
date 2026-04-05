import { Document,Types } from "mongoose";
import { otpPurpose, Roles } from "../constants/constants";
import { OtpPurpose } from "../constants/constants";
 
export type roles=typeof Roles[keyof typeof Roles]

 export interface IOTP extends Document {
  _id:Types.ObjectId;
  email: string;
  otp: string;
  purpose:otpPurpose;
  userData:OtpUserData
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  
}
// it contain temporary userinfo while verifying the email
export interface OtpUserData{
      name: string;
      email: string;
      phone?: string;
      password:string;
      role: roles;
}

export interface OtpData{
   email:string;
   otp:string;
   purpose:otpPurpose;
   userData:OtpUserData;
   expireAt:Date;
   createdAt:Date
}