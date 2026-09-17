import { DashboardResponseDTO } from "../../dtos/admin.dto/dashboard.dto"
export interface IDashboardService {
    getAdminDashboard(): Promise<DashboardResponseDTO>
}