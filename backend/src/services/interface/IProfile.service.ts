import {
    UserResponseDTO
    , profileDetailChangeDTO,
    changePasswordDTO,
    changeEmailDTO,
    changeEmailResponseDto,
    changeEmailVerificationDTO,
    ResendOtpDTO
} from "../../dtos/Common.dto";

export interface IProfileService {
    getProfileData(id: string): Promise<UserResponseDTO>
    changeProfileDetails(id: string, data: profileDetailChangeDTO): Promise<UserResponseDTO>
    changePassword(id: string, data: changePasswordDTO): Promise<UserResponseDTO>
    changeEmail(data:changeEmailDTO):Promise<changeEmailResponseDto>
    changeEmailVerification(userId:string,data:changeEmailVerificationDTO):Promise<UserResponseDTO>
    changeEmailResendOtp(data:ResendOtpDTO):Promise<changeEmailResponseDto>
}