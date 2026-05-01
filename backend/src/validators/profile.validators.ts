import {
    profileDetailChangeSchema,
    changePasswordSchema,
    changeEmailSchema,
    changeEmailVerificationSchema
} from '../dtos/Common.dto'


export const ProfileValidators = {
    profileDeatailsChangeValidator: profileDetailChangeSchema,
    changePasswordValidator: changePasswordSchema,
    changeEmailValidator:changeEmailSchema,
    changeEmailVerificationValidator:changeEmailVerificationSchema
}