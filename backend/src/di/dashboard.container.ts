import { DashboardRepository } from "../repositories/implementations/Dashboard.repository";
import { DashboardService } from "../services/implementations/Dashboard.service";
import { DashboardController } from "../controllers/implimentations/Dashboard.controller";
import { AuctionHouseRepository } from "../repositories/implementations/AuctionHouse.repository";

const dashboardRepo = new DashboardRepository();
const houseRepo=new AuctionHouseRepository()
const dashboardService = new DashboardService(dashboardRepo,houseRepo);
export const dashboardController = new DashboardController(dashboardService)
