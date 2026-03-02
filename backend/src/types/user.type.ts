import { Document, Types } from "mongoose";
import { Roles } from "../constants/constants";

export type roles=typeof Roles[keyof typeof Roles]

export interface IUser {
    _id: Types.ObjectId;
    name: string;
    email: string;
    phone?: string;
    password?:string;
    role: roles;
    profileImage?: string;
    googleId?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export type IUserDocument = IUser & Document;