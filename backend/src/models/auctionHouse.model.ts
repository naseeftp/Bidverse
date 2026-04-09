import mongoose,{Schema} from "mongoose";
import { VerificationStatus } from "../constants/constants";
import { IAuctionHouseDocument } from "../types/auctionhouse.type";


const  AuctionHouseSchema=new Schema<IAuctionHouseDocument>({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true,
        trim:true,
    },
    yearEstablished:{
        type:Number,
        required:true
    },
    briefDescription:{
        type:String,
        required:true
    },
    address:{
        city:{
            type:String,
            required: true
        },
        state:{
            type:String,
            required:true
        },
        country:{
            type:String,
            required:true
        },
        fullAddress:{
            type:String,
            required:true
        }
    },
    contact:{
        primaryContactName:{
            type:String,
            required:true
        },
        businessEmail:{
            type:String,
            required:true
        },
        phone:{
            type:String,
            required:true
        }
    },
    legal:{
        registrationNumber:{
            type:String,
            required:true,
        },
        taxId:{
            type:String,
            required:true
        },
        registrationCertificateUrl:{
            type:String,
            required:true
        },
        identityProofUrl:{
            type:String,
            required:true
        }
    },
    status:{
        type:String,
        enum:Object.values(VerificationStatus),
        default:VerificationStatus.PENDING
    },
    rejectionReason:{
        type:String,
        default:null
    },
    isVerified:{
        type:Boolean,
        default:false
    }

},{timestamps:true})


export const AuctionHouse=mongoose.model<IAuctionHouseDocument>('AuctionHouse',AuctionHouseSchema)