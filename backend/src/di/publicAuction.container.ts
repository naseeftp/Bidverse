import { AuctionHouseRepository } from "../repositories/implementations/AuctionHouse.repository";
import { LoggerService } from "../services/implementations/Logger.service";
import { PublicAuctionController } from "../controllers/implimentations/PublicAuction.controller";
import { PublicAuctionService } from "../services/implementations/PublicAuction.service";
import { AuctionItemRepository } from "../repositories/implementations/AuctionItem.repository";

const auctionHouseRepo = new AuctionHouseRepository();
const PublicAuctionServiceLogger = new LoggerService('publicAuctionService');

const pulicAuctionItemServiceLogger=new LoggerService('public Auction Item logger')
const auctionItemRepo=new AuctionItemRepository()

const publicAuctionService = new PublicAuctionService(auctionHouseRepo, PublicAuctionServiceLogger,auctionItemRepo);
const PublicAuctionControllerLogger = new LoggerService('publicAuctionController');
export const publicAuctionController = new PublicAuctionController(publicAuctionService,PublicAuctionControllerLogger)
