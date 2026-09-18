import axiosInstance from "../api/axios.instance"
import { BASE_ROUTES, DASHBOARD_ROUTES } from "../constants/api.constant"
import type { ApiResponse } from "../types/auth.type"
import type { DashboardResponseDTO } from "../types/dashboard.dto"
import type { TenantDashboardResponseDTO } from "../types/tenantDashboard.dto"
import { apiErrorHandler } from "../utils/error.handle"

class DashboardService{
async getAdminDashboard(){
    try {
        const url=`${BASE_ROUTES.DASHBOARD}${DASHBOARD_ROUTES.GET_ADMIN_DASHBOARD}`
        const response=await axiosInstance.get<DashboardResponseDTO,ApiResponse<DashboardResponseDTO>>(url)
        return {
            success:true,
            data:response.data,
            message:response.message
        }
    } catch (error) {
        return apiErrorHandler(error,'Failed to get Admin Dashboard')
    }
}
async getTenantDashboard(){
    try {
        const url=`${BASE_ROUTES.DASHBOARD}${DASHBOARD_ROUTES.GET_TENANT_DASHBOARD}`
        const response=await axiosInstance.get< TenantDashboardResponseDTO,ApiResponse<TenantDashboardResponseDTO>>(url)
        return {
            success:true,
            data:response.data,
            message:response.message
        }
    } catch (error) {
        return apiErrorHandler(error,'Failed to get Admin Dashboard')
    }
}


}

export default new DashboardService()