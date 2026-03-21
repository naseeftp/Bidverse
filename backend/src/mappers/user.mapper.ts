import { IUserDocument } from '../types/user.type'
import { UserResponseDTO } from '../dtos/Common.dto'

export class UserMapper {
    static toDTO(user: IUserDocument): UserResponseDTO {
        return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            profileImage: user.profileImage,
            isActive: user.isActive
        }
    }
}