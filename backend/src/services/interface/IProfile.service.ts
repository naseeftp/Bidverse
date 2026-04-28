import { UserResponseDTO } from "../../dtos/Common.dto";

export interface IProfileService{
getProfileData(id:string):Promise<UserResponseDTO>

}