import { RevenueRepository } from "../repositories/implementations/Revenue.repository";
import { RevenueService } from "../services/implementations/Revenue.service";
import { RevenueController } from "../controllers/implimentations/Revenue.controller";


const revenueRepo=new RevenueRepository();
const revenueService=new RevenueService(revenueRepo);
export const revenueController=new RevenueController(revenueService)

