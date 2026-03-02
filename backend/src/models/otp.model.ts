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
    expiresAt: {
        type: Date,
    }
},
    {
        timestamps: true,
    }
)

const otpModel: Model<IOTP> = model<IOTP>('Otp', otpSchema)
export default otpModel