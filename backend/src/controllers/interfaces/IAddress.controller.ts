import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from 'express-serve-static-core'
import { deleteAddressDTO } from "../../dtos/user.dto/address.dto";


export interface IAddressController {
    createAddress(req: Request, res: Response, next: NextFunction): Promise<void>
    listAllUserAddress(req: Request, res: Response, next: NextFunction): Promise<void>
    deleteAddress(
        req: Request<ParamsDictionary,unknown,deleteAddressDTO>,
        res: Response,
        next: NextFunction): Promise<void>
}