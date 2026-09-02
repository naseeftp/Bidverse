import { LiveAuctionSateRepository } from "../repositories/implementations/LiveAuctionState.repository";
import { LiveAuctionStateService } from "../services/implementations/LiveAuctionState.service";
import { LiveController } from "../controllers/implimentations/liveState.controller";
import { SlotRepository } from "../repositories/implementations/Slot.repository";
import { AuctionItemRepository } from "../repositories/implementations/AuctionItem.repository";
import { NotificationService} from "../services/implementations/Notification.service";
import { NotificationRepository } from "../repositories/implementations/NotificationRepository";


const liveAUctionRepo=new LiveAuctionSateRepository();
const slotRepo=new SlotRepository();
const auctionRepo=new AuctionItemRepository();
const notificationRepo=new NotificationRepository()
const notificationService=new NotificationService(notificationRepo)
const LiveService =new LiveAuctionStateService(liveAUctionRepo,slotRepo,auctionRepo,notificationService);
const liveController=new LiveController(LiveService)
export  default liveController