import { Router } from "express";
import { publicAuctionController } from '../di/publicAuction.container'
import { PUBLIC_ROUTES } from "../constants/route.constant";

const router = Router()
router.get(
    PUBLIC_ROUTES.AUCTION_HOUSES,
    (req,res,next)=>publicAuctionController. listAllPublicAuctionHouses(req,res,next)
)
export default router