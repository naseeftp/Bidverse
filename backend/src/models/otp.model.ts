import { IOTP } from '../types/otp.type'
import { Schema, model, Model, Document } from 'mongoose'

const otpSchema = new Schema<IOTP>({
    email: {
        type: String,
        required: true,
        trim: true,
    },
    otp: {
        type: String,
        required: true
    },
    userData:{
       name:String,
       email:String,
       phone:String,
       password:String,
       role:String
    },
    expiresAt: {
        type: Date,
        required:true
    }
},
    {
        timestamps: true,
    }
)
otpSchema.index({email:1,otp:1})
const otpModel: Model<IOTP> = model<IOTP>('Otp', otpSchema)
export default otpModel