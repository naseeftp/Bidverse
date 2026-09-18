import { DashboardResponseDTO } from "../../dtos/admin.dto/dashboard.dto"
import { TenantDashboardResponseDTO } from "../../dtos/auctionHouse.dto/dashboard.dto"
export interface IDashboardService {
    getAdminDashboard(): Promise<DashboardResponseDTO>
    getTenantDashboard(tenantUserId:string):Promise<TenantDashboardResponseDTO>
}