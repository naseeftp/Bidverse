import { AuctionHouseRepository } from "../repositories/implementations/AuctionHouse.repository";
import { LoggerService } from "../services/implementations/Logger.service";
import { PublicAuctionController } from "../controllers/implimentations/PublicAuction.controller";
import { PublicAuctionService } from "../services/implementations/PublicAuction.service";
const auctionHouseRepo = new AuctionHouseRepository();
const PublicAuctionServiceLogger = new LoggerService('publicAuctionService');

const publicAuctionService = new PublicAuctionService(auctionHouseRepo, PublicAuctionServiceLogger);
const PublicAuctionControllerLogger = new LoggerService('publicAuctionController');
export const publicAuctionController = new PublicAuctionController(publicAuctionService, PublicAuctionControllerLogger)
