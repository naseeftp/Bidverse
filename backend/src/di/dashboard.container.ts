import { DashboardRepository } from "../repositories/implementations/Dashboard.repository";
import { DashboardService } from "../services/implementations/Dashboard.service";
import { DashboardController } from "../controllers/implimentations/Dashboard.controller";

const dashboardRepo = new DashboardRepository();
const dashboardService = new DashboardService(dashboardRepo);
export const dashboardController = new DashboardController(dashboardService)
