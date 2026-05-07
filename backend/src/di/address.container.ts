import { AddressRepository } from "../repositories/implementations/Address.repository";
import { LoggerService } from "../services/implementations/Logger.service";
import { AddressService } from "../services/implementations/AddressService";
import { AddressController } from "../controllers/implimentations/Address.controller";

const addressRepo = new AddressRepository();
const addressServiceLogger = new LoggerService('addressServiceLogger')
const addressService = new AddressService(addressRepo, addressServiceLogger)
const addressControllerLogger = new LoggerService('addressControllerLogger');
export const addressController = new AddressController(addressService, addressControllerLogger)

