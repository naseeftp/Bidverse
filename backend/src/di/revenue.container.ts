import { RevenueRepository } from "../repositories/implementations/Revenue.repository";
import { RevenueService } from "../services/implementations/Revenue.service";
import { RevenueController } from "../controllers/implimentations/Revenue.controller";
import { AuctionHouseRepository } from "../repositories/implementations/AuctionHouse.repository";

const revenueRepo=new RevenueRepository();
const houseRepo=new AuctionHouseRepository()
const revenueService=new RevenueService(revenueRepo,houseRepo);
export const revenueController=new RevenueController(revenueService)

