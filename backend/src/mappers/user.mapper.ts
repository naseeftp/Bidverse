import { IUserDocument } from '../types/user.type'
import { UserResponseDTO } from '../dtos/auth.dto'

export class UserMapper {
    static toResponseDTO(user: IUserDocument): UserResponseDTO {
        return {
            id: String(user._id),
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            profileImage: user.profileImage,
            isActive: user.isActive
        }
    }
}