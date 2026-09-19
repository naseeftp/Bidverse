import { RevenueBreakdownResponseDTO,IncomingRevenueRowDTO } from "../../dtos/admin.dto/revenue.dto";
import { RevenueGranularity } from "../../repositories/interfaces/IRevenue.repository";
import { IGenericPaginatedResposnse } from "../../types/response.type";

export interface IRevenueService {
getRevenueBreakdown(startDate?: string, endDate?: string, granularity?: RevenueGranularity): Promise<RevenueBreakdownResponseDTO>;
 getIncomingRevenueList(startDate: string, endDate: string, page: number, limit: number): Promise<IGenericPaginatedResposnse<IncomingRevenueRowDTO>>;

}
