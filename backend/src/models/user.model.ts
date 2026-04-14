import { Schema, model, Model } from 'mongoose'
import { IUserDocument } from '../types/user.type';
import { Roles } from '../constants/constants';

const UserSchema = new Schema<IUserDocument>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: false,
    },
    password: {
        type: String
    },
    role: {
        type: String,
        enum: Object.values(Roles),
        default: Roles.USER,
        required: true
    },
    profileImage: {
        type: String,
        default: null
    },
    googleId: {
        type: String,
        required: false,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true,

    },
    passwordResetToken: {
        type: String,
        required: false,
        default: null
    },
    passwordResetExpires: {
        type: Date,
        required: false,
        default: null
    },
    createdAt: {
        type: Date,
    },
    updatedAt: {
        type: Date
    }

})

const UserModel: Model<IUserDocument> = model<IUserDocument>('User', UserSchema)
export default UserModel