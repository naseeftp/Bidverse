import { LiveAuctionSateRepository } from "../repositories/implementations/LiveAuctionState.repository";
import { LiveAuctionStateService } from "../services/implementations/LiveAuctionState.service";
import { LiveController } from "../controllers/implimentations/liveState.controller";


const liveAUctionRepo=new LiveAuctionSateRepository();
const LiveService =new LiveAuctionStateService(liveAUctionRepo);
const liveController=new LiveController(LiveService)
export  default liveController