import { Router } from "express";
import { CheckUserBlocked } from "../middlewares/check-user-blocked-middleware";
import { protect,allowedTo } from "../middlewares/auth.middleware";
import { validator } from "../middlewares/validation.middleware";
import {addressController } from '../di/address.container'
import { AddressValidator } from "../validators/address.validator";
import { ADDRESS_ROUTES } from "../constants/route.constant";
import { Role } from "../dtos/Common.dto";

const router= Router()
router.use(protect),
router.use(CheckUserBlocked)

router.post(
    ADDRESS_ROUTES.CREATE_ADDRESS,
    allowedTo(Role.USER),
    validator(AddressValidator.createAddressValidator),
    (req,res,next)=>addressController.createAddress(req,res,next)
)
router.get(
    ADDRESS_ROUTES.GET_USER_ADDRESS,
    allowedTo(Role.USER),
    (req,res,next)=>addressController.listAllUserAddress(req,res,next)
)

export default router