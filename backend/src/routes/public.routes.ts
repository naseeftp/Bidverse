import { Router } from "express";
import { publicAuctionController } from '../di/publicAuction.container'
import { PUBLIC_ROUTES } from "../constants/route.constant";

const router = Router()
router.get(
    PUBLIC_ROUTES.AUCTION_HOUSES,
    (req, res, next) => publicAuctionController.listAllPublicAuctionHouses(req, res, next)
)
router.get(
    PUBLIC_ROUTES.AUCTION_HOUSE,
    (req, res, next) => publicAuctionController.getHouseDetailsWithAuctions(req, res, next)
)
router.get(
    PUBLIC_ROUTES.AUCTIONS,
    (req, res, next) => publicAuctionController.getPublicAuctions(req, res, next)
)
router.get(
    PUBLIC_ROUTES.GET_AUCTION,
    (req, res, next) => publicAuctionController.getAuctionDetails(req, res, next)

)
export default router