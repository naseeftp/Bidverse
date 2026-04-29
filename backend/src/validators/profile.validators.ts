import { profileDetailChangeSchema } from '../dtos/Common.dto'
import { changePasswordSchema } from '../dtos/Common.dto'

export const ProfileValidators = {
    profileDeatailsChangeValidator: profileDetailChangeSchema,
    changePasswordValidator:changePasswordSchema
}