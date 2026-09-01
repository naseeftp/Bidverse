import { LiveAuctionSateRepository } from "../repositories/implementations/LiveAuctionState.repository";
import { LiveAuctionStateService } from "../services/implementations/LiveAuctionState.service";
import { LiveController } from "../controllers/implimentations/liveState.controller";
import { SlotRepository } from "../repositories/implementations/Slot.repository";
import { AuctionItemRepository } from "../repositories/implementations/AuctionItem.repository";

const liveAUctionRepo=new LiveAuctionSateRepository();
const slotRepo=new SlotRepository();
const auctionRepo=new AuctionItemRepository()
const LiveService =new LiveAuctionStateService(liveAUctionRepo,slotRepo,auctionRepo);
const liveController=new LiveController(LiveService)
export  default liveController