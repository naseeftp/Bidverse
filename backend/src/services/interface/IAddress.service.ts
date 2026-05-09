import { CreateAddressDTO,AddressResponseDTO} from "../../dtos/user.dto/address.dto";
import { IGenericPaginatedResposnse } from "../../types/response.type";

export interface IAddressService{
    createAddress(userId:string,data:CreateAddressDTO):Promise<AddressResponseDTO>
    listAllUserAddress(userId:string,page:number,limit:number):Promise<IGenericPaginatedResposnse<AddressResponseDTO>>
}