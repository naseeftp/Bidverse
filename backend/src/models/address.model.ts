import mongoose, { Schema } from "mongoose";
import { IAddressDocument } from "../types/address.type";
import { AddressLabelValues } from "../constants/constants";

const AddressSchema = new Schema<IAddressDocument>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true,
        required: true
    },
    label: {
        type: String,
        required: true,
        trim: true,
        enum: AddressLabelValues
    },
    recipientName: {
        type: String,
        trim: true,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    altPhone: {
        type: String,
        trim: true
    },
    fullAddress: {
        type: String,
        trim: true,
        required: true,
    },
    pincode: {
        type: String,
        required: true,
        trim: true,
    },
    landMark: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true
    },
    isActive:{
        type:Boolean,
        default:true,
    },
    isDefault:{
        type:Boolean,
        default:false
    }

},{timestamps:true})

export const Address=mongoose.model<IAddressDocument>('Address',AddressSchema)