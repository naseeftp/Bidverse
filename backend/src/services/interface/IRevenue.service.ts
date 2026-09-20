import { RevenueBreakdownResponseDTO, IncomingRevenueRowDTO } from "../../dtos/admin.dto/revenue.dto";
import { RevenueGranularity } from "../../repositories/interfaces/IRevenue.repository";
import { IGenericPaginatedResposnse } from "../../types/response.type";
import { TenantIncomingRevenueRowDTO,TenantRevenueBreakdownResponseDTO } from "../../dtos/auctionHouse.dto/revenue.dto";

export interface IRevenueService {
    getRevenueBreakdown(startDate?: string, endDate?: string, granularity?: RevenueGranularity): Promise<RevenueBreakdownResponseDTO>;
    getIncomingRevenueList(startDate: string, endDate: string, page: number, limit: number): Promise<IGenericPaginatedResposnse<IncomingRevenueRowDTO>>;
    getTenantRevenueBreakdown(tenantUserId: string, startDate?: string, endDate?: string, granularity?: RevenueGranularity): Promise<TenantRevenueBreakdownResponseDTO>;
    getTenantIncomingRevenueList(tenantUserId: string, startDate: string, endDate: string, page: number, limit: number): Promise<IGenericPaginatedResposnse<TenantIncomingRevenueRowDTO>>;

}
