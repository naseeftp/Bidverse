import { Router } from "express";
import { allowedTo,protect } from "../middlewares/auth.middleware";
import { Role } from "../dtos/Common.dto";
import { AUCTION_ITEM_ROUTES } from "../constants/route.constant";
import { AuctionItemValidators } from "../validators/auctionItem.validator";
import { CheckUserBlocked } from "../middlewares/check-user-blocked-middleware";
import {auctionItemMangementController} from '../di/auctionItem.container'
import { validator } from "../middlewares/validation.middleware";


const router=Router()
router.use(protect);
router.use(CheckUserBlocked)

router.post(
    AUCTION_ITEM_ROUTES.CREATE,
    allowedTo(Role.TENANT),
    validator(AuctionItemValidators.validateCreationInput),
    (req,res,next)=>auctionItemMangementController.createAuctionItem(req,res,next)
)
router.get(
    AUCTION_ITEM_ROUTES.ADMIN_AUCTIONS,
    allowedTo(Role.ADMIN),
    (req,res,next)=>auctionItemMangementController.getAllAuctionByAdmin(req,res,next)
)
router.get(
    AUCTION_ITEM_ROUTES.TENANT_AUCTIONS,
    allowedTo(Role.TENANT),
    (req,res,next)=>auctionItemMangementController.getTenantAuctions(req,res,next)
)
router.get(
    AUCTION_ITEM_ROUTES.GET_AUCTION,
    allowedTo(Role.ADMIN,Role.TENANT),
    (req,res,next)=>auctionItemMangementController.getAuctionDetails(req,res,next)
)
router.patch(
    AUCTION_ITEM_ROUTES.UPDATE_STATUS,
    allowedTo(Role.ADMIN),
    validator(AuctionItemValidators.validateUpdateStatusInput),
    (req,res,next)=>auctionItemMangementController.updateAuctionStatus(req,res,next)
)
export default router
