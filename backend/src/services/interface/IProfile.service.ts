import {UserResponseDTO,profileDetailChangeDTO} from "../../dtos/Common.dto";

export interface IProfileService{
getProfileData(id:string):Promise<UserResponseDTO>
changeProfileDetails(id:string,data:profileDetailChangeDTO):Promise<UserResponseDTO>
}