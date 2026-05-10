import { IAddressService } from "../interface/IAddress.service";
import { IAddressRepository } from "../../repositories/interfaces/IAddress.repository";
import { ILoggerService } from "../interface/ILogger.service";
import { CreateAddressDTO, AddressResponseDTO, deleteAddressDTO } from "../../dtos/user.dto/address.dto";
import { AppError, NotFoundError,ForbiddenError} from "../../errors/AppError";
import { Types } from 'mongoose'
import { AddressMapper } from "../../mappers/address.mapper";
import { AddressLabel, MESSAGES } from "../../constants/constants";
import { IGenericPaginatedResposnse } from "../../types/response.type";
export class AddressService implements IAddressService {
  constructor(
    private _addressRepo: IAddressRepository,
    private _logger: ILoggerService
  ) { }

  async createAddress(userId: string, data: CreateAddressDTO): Promise<AddressResponseDTO> {
    const existingCount = await this._addressRepo.countByUserId(userId);
    this._logger.info('existing address count', {
      userId: userId,
      count: existingCount
    })
    if (existingCount >= 5) {
      throw new AppError("Maximum address limit (5) reached.")
    }
    const isDuplicate = await this._addressRepo.findDuplicate(userId, data.fullAddress, data.city, data.pincode)
    if (isDuplicate) {
      throw new AppError('This address allredy saved')
    }
    const shouldBeDefault = existingCount === 0 ? true : data.isDefault
    if (shouldBeDefault) {
      await this._addressRepo.unsetDefaults(userId)
    }
    const newAddress = await this._addressRepo.create({
      ...data,
      label: data.label as AddressLabel,
      userId: new Types.ObjectId(userId),
      isActive: true,
      isDefault: shouldBeDefault
    })
    return AddressMapper.toAddressDto(newAddress)
  }

  async listAllUserAddress(userId: string, page: number, limit: number): Promise<IGenericPaginatedResposnse<AddressResponseDTO>> {
    const { docs, total } = await this._addressRepo.findAllUserAddress(userId, page, limit)
    const mappedAddress = docs.map((address) => AddressMapper.toAddressDto(address));
    return {
      data: mappedAddress,
      pagination: {
        totalItems: total,
        itemsPerPage: limit,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    }
  }

  async deleteAddress(userId: string, addressId: string, data: deleteAddressDTO): Promise<AddressResponseDTO | null> {

    const filter = {
      _id: addressId,
      userId: userId,
    }
    const deletedAddress = await this._addressRepo.updateByFilter(filter, data)
    if (!deletedAddress) {
      throw new NotFoundError(MESSAGES.ADDRES_NOT_FOUND)
    }
    return AddressMapper.toAddressDto(deletedAddress)
  }

  async editAddress(userId: string, addressId: string, data: CreateAddressDTO): Promise<AddressResponseDTO> {
    const existingAddress=await this._addressRepo.findById(addressId)
    if(!existingAddress){
      throw new NotFoundError(MESSAGES.ADDRES_NOT_FOUND)
    }
    if(existingAddress.userId.toString()!==userId){
     throw new ForbiddenError('"You do not have permission to edit this address"')
    }
    if(data.isDefault){
      await this._addressRepo.unsetDefaults(userId)
    }
    const filter = {
      _id: addressId,
      userId: userId
    }
    const editedAddress = await this._addressRepo.updateByFilter(filter, data);
    return AddressMapper.toAddressDto(editedAddress!)
  }
}