import { AuctionItemRepository } from "../repositories/implementations/AuctionItem.repository";
import { LoggerService } from "../services/implementations/Logger.service";
import { AuctionHouseRepository } from "../repositories/implementations/AuctionHouse.repository";
import { AuctionItemMangementController } from "../controllers/implimentations/AuctionItemMangement.controller";
import { AuctionItemMangementSevice } from "../services/implementations/AuctionItemMangement.sevice";

const auctionHouseRepo=new AuctionHouseRepository();
const auctionItemRepo=new AuctionItemRepository();
const aucionItemServiceLogger=new LoggerService('auctionItemManagementService');
const auctioItemMangementService=new AuctionItemMangementSevice(auctionItemRepo,auctionHouseRepo,aucionItemServiceLogger)
const auctionItemControllerLogger=new LoggerService('auctionItemMangemenController')
export const auctionItemMangementController=new AuctionItemMangementController(auctionItemControllerLogger,auctioItemMangementService)