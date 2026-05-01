import { IOTP } from '../types/otp.type'
import { Schema, model, Model} from 'mongoose'
import { OtpPurpose } from '../constants/constants'
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
    purpose: {
        type: String,
        required:false,
        enum: Object.values(OtpPurpose),
    },
    userData: {
        name: String,
        email: String,
        phone: String,
        password: String,
        role: String
    },
    expiresAt: {
        type: Date,
        required: true
    }
},
    {
        timestamps: true,
    }
)
otpSchema.index({ email: 1, otp: 1 })
const otpModel: Model<IOTP> = model<IOTP>('Otp', otpSchema)
export default otpModel