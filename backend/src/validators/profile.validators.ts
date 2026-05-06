import {
    profileDetailChangeSchema,
    changePasswordSchema,
    changeEmailSchema,
    changeEmailVerificationSchema
} from '../dtos/Common.dto'
import { changeBusinessDetailsSchema } from '../dtos/auctionHouse.dto/auctionHouse.dto'


export const ProfileValidators = {
    profileDeatailsChangeValidator: profileDetailChangeSchema,
    changePasswordValidator: changePasswordSchema,
    changeEmailValidator:changeEmailSchema,
    changeEmailVerificationValidator:changeEmailVerificationSchema,
    changeBusinessDetailsValidator:changeBusinessDetailsSchema
}