import {
    UserResponseDTO
    , profileDetailChangeDTO,
    changePasswordDTO
} from "../../dtos/Common.dto";

export interface IProfileService {
    getProfileData(id: string): Promise<UserResponseDTO>
    changeProfileDetails(id: string, data: profileDetailChangeDTO): Promise<UserResponseDTO>
    changePassword(id: string, data: changePasswordDTO): Promise<UserResponseDTO>
}