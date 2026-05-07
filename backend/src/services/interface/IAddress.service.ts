import { CreateAddressDTO,AddressResponseDTO} from "../../dtos/user.dto/address.dto";


export interface IAddressService{
    createAddress(userId:string,data:CreateAddressDTO):Promise<AddressResponseDTO>
}