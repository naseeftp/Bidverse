import { SlotRepository } from "../repositories/implementations/Slot.repository";
import { SlotService } from "../services/implementations/Slot.service";
import { SlotController } from "../controllers/implimentations/Slot.controller";
import { AuctionHouseRepository } from "../repositories/implementations/AuctionHouse.repository";
import { AuctionItemRepository } from "../repositories/implementations/AuctionItem.repository";

const slotRepo=new SlotRepository()
const auctionRepo=new AuctionItemRepository();
const auctionHouseRepo=new AuctionHouseRepository();
const slotService=new SlotService(slotRepo,auctionHouseRepo,auctionRepo)
export const slotController=new SlotController(slotService)
