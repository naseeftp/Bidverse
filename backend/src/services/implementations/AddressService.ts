import { IAddressService } from "../interface/IAddress.service";
import { IAddressRepository } from "../../repositories/interfaces/IAddress.repository";
import { ILoggerService } from "../interface/ILogger.service";
import { CreateAddressDTO, AddressResponseDTO } from "../../dtos/user.dto/address.dto";
import { AppError } from "../../errors/AppError";
import { Types } from 'mongoose'
import { AddressMapper } from "../../mappers/address.mapper";
import { AddressLabel } from "../../constants/constants";
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
    if (existingCount > 5) {
      throw new AppError("Maximum address limit (5) reached.")
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


}