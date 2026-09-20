import axiosInstance from "../api/axios.instance";
import { BASE_ROUTES, REVENUE_ROUTES } from "../constants/api.constant";
import type { ApiResponse, IPaginationMeta } from "../types/auth.type";
import type { IncomingRevenueRowDTO, RevenueBreakdownResponseDTO } from "../types/revenue.types";
import type { TenantIncomingRevenueRowDTO, TenantRevenueBreakdownResponseDTO } from "../types/tenantrRevenue.type";
import { apiErrorHandler } from "../utils/error.handle";

export class RevenueService {
    async getRevenueBreakdown(startDate: string, endDate: string, granularity: string) {
        try {
            const url = `${BASE_ROUTES.REVENUE}${REVENUE_ROUTES.GET_REVENUE_BREAKDOWN}?startDate=${startDate}&endDate=${endDate}&granularity=${granularity}`;
            const response = await axiosInstance.get<RevenueBreakdownResponseDTO, ApiResponse<RevenueBreakdownResponseDTO>>(url);
            return {
                success: true,
                data: response.data,
                message: response.message,
            }
        } catch (error) {
            return apiErrorHandler(error, 'Failed to get revenue Breakdown')
        }
    }
    async getIncomingRevenueList(startDate: string, endDate: string, page: number, limit: number) {
        try {
            const url = `${BASE_ROUTES.REVENUE}${REVENUE_ROUTES.GET_REVENUE_LIST}?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`;
            const response = await axiosInstance.get<IncomingRevenueRowDTO, ApiResponse<{ data: IncomingRevenueRowDTO[], pagination: IPaginationMeta }>>(url);
            const paginatedResult = response.data;
            return {
                success: true,
                data: paginatedResult?.data,
                pagination: paginatedResult?.pagination,
                message: response.message
            }
        } catch (error) {
            return apiErrorHandler(error, 'Failed to get Revenue List')
        }
    }
    async getTenantRevenueBreakdown(startDate: string, endDate: string, granularity: string) {
        try {
            const url = `${BASE_ROUTES.REVENUE}${REVENUE_ROUTES.GET_TENANT_REVENUE_BREAKDOWN}?startDate=${startDate}&endDate=${endDate}&granularity=${granularity}`;
            const response = await axiosInstance.get<TenantRevenueBreakdownResponseDTO, ApiResponse<TenantRevenueBreakdownResponseDTO>>(url);
            return { success: true, data: response.data, message: response.message };
        } catch (error) {
            return apiErrorHandler(error, 'Failed to get revenue breakdown');
        }
    }

    async getTenantIncomingRevenueList(startDate: string, endDate: string, page: number, limit: number) {
        try {
            const url = `${BASE_ROUTES.REVENUE}${REVENUE_ROUTES.GET_TENANT_REVENUE_LIST}?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`;
            const response = await axiosInstance.get<TenantIncomingRevenueRowDTO, ApiResponse<{ data: TenantIncomingRevenueRowDTO[]; pagination: IPaginationMeta }>>(url);
            const paginatedResult = response.data;
            return {
                success: true,
                data: paginatedResult?.data,
                pagination: paginatedResult?.pagination,
                message: response.message
            };
        } catch (error) {
            return apiErrorHandler(error, 'Failed to get revenue list');
        }
    }

}
export default new RevenueService()