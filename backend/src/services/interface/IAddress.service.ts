import { CreateAddressDTO, AddressResponseDTO, deleteAddressDTO } from "../../dtos/user.dto/address.dto";
import { IGenericPaginatedResposnse } from "../../types/response.type";

export interface IAddressService {
    createAddress(userId: string, data: CreateAddressDTO): Promise<AddressResponseDTO>
    listAllUserAddress(userId: string, page: number, limit: number): Promise<IGenericPaginatedResposnse<AddressResponseDTO>>
    deleteAddress(userId: string, addressId: string, data: deleteAddressDTO): Promise<AddressResponseDTO | null>
    editAddress(userId: string, addressId: string, data: CreateAddressDTO): Promise<AddressResponseDTO>
}