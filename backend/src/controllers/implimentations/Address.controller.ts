import { Request, Response, NextFunction } from "express";
import { IAddressService } from "../../services/interface/IAddress.service";
import { ILoggerService } from "../../services/interface/ILogger.service";
import { IAddressController } from "../interfaces/IAddress.controller";
import { SuccessResponse } from "../../utils/response.utility";
import { HttpStatus, MESSAGES } from "../../constants/constants";
import { ParamsDictionary } from "express-serve-static-core";
import { deleteAddressDTO } from "../../dtos/user.dto/address.dto";

export class AddressController implements IAddressController {
    constructor(
        private _addressService: IAddressService,
        private _logger: ILoggerService
    ) { }
    async createAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId=req.user.id;
            this._logger.info('call reached on address controller')
            const result=await this._addressService.createAddress(userId,req.body)
            SuccessResponse(res,MESSAGES.ADDRESS_CREATED,result,HttpStatus.CREATED)
        } catch (error) {
            next(error)
        }
    }
    async listAllUserAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId=req.user.id;
            const page=Number(req.query.page)||1;
            const limit=Number( req.query.limit)||10
            const result=await this._addressService.listAllUserAddress(userId,page,limit)
            SuccessResponse(res,MESSAGES.LIST_RETRIEVED,result,HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
async deleteAddress(req: Request<ParamsDictionary, unknown, deleteAddressDTO>, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId=req.user.id;
        const addressId=req.params.id as string;
        const result=await this._addressService.deleteAddress(userId,addressId,req.body)
        SuccessResponse(res,MESSAGES.ADDRESS_DELETED,result,HttpStatus.OK)
    } catch (error) {
        next(error)
    }
}

}