import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from 'express-serve-static-core'
import { CreateAddressDTO, deleteAddressDTO } from "../../dtos/user.dto/address.dto";


export interface IAddressController {
    createAddress(req: Request, res: Response, next: NextFunction): Promise<void>
    listAllUserAddress(req: Request, res: Response, next: NextFunction): Promise<void>
    deleteAddress(req: Request<ParamsDictionary, unknown, deleteAddressDTO>, res: Response, next: NextFunction): Promise<void>;
    editAddress(req:Request<ParamsDictionary,unknown,CreateAddressDTO>,res:Response,next:NextFunction):Promise<void>

}