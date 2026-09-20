import { IRevenueService } from "../interface/IRevenue.service";
import { IRevenueRepository, RevenueGranularity } from "../../repositories/interfaces/IRevenue.repository";
import { RevenueBreakdownResponseDTO, IncomingRevenueRowDTO } from "../../dtos/admin.dto/revenue.dto";
import { IGenericPaginatedResposnse } from "../../types/response.type";
import { RevenueMapper } from "../../mappers/revenue.mapper";
import { IAuctionHouseRepository } from "../../repositories/interfaces/IAuctionHouse.repository";
import { TenantIncomingRevenueRowDTO, TenantRevenueBreakdownResponseDTO } from "../../dtos/auctionHouse.dto/revenue.dto";
import { NotFoundError } from "../../errors/AppError";
import { MESSAGES } from "../../constants/constants";


export class RevenueService implements IRevenueService {
    constructor(
        private _revenueRepo: IRevenueRepository,
        private _houseRepo: IAuctionHouseRepository
    ) { }
    private resolveRange(startDate?: string, endDate?: string) {
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { start, end };
    }
    async getRevenueBreakdown(startDate?: string, endDate?: string, granularity: RevenueGranularity = 'day'): Promise<RevenueBreakdownResponseDTO> {
        const { start, end } = this.resolveRange(startDate, endDate);

        const [totalCommission, totalRefunded, refundRate, trend, bySourceRaw, byHouseRaw] = await Promise.all([
            this._revenueRepo.getTotalCommission(start, end),
            this._revenueRepo.getTotalRefunded(start, end),
            this._revenueRepo.getRefundRate(start, end),
            this._revenueRepo.getRevenueTrend(start, end, granularity),
            this._revenueRepo.getRevenueBySource(start, end),
            this._revenueRepo.getRevenueByHouse(start, end),
        ]);
        const bySource = bySourceRaw.map(s => ({ source: s.source as "order" | "slot_booking", amount: s.amount, count: s.count }));

        const totalHouseRevenue = byHouseRaw.reduce((sum, h) => sum + h.totalRevenue, 0);
        const byHouse = byHouseRaw.map(h => ({
            ...h,
            sharePercent: totalHouseRevenue > 0 ? Math.round((h.totalRevenue / totalHouseRevenue) * 1000) / 10 : 0
        }));

        return {
            range: { startDate: start.toISOString(), endDate: end.toISOString() },
            totalCommission,
            totalRefunded,
            refundRate,
            trend,
            bySource,
            byHouse,
        };
    }
    async getIncomingRevenueList(startDate: string, endDate: string, page: number, limit: number): Promise<IGenericPaginatedResposnse<IncomingRevenueRowDTO>> {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const { docs, total } = await this._revenueRepo.getIncomingRevenueList(start, end, page, limit);

        return {
            data: RevenueMapper.toIncomingRevenueList(docs),
            pagination: {
                totalItems: total,
                itemsPerPage: limit,
                currentPage: page,
                totalPages: Math.ceil(total / limit) || 1,
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1,
            }
        };
    }
    async getTenantRevenueBreakdown(tenantUserId: string, startDate?: string, endDate?: string, granularity: RevenueGranularity = 'day'): Promise<TenantRevenueBreakdownResponseDTO> {
        const house = await this._houseRepo.findOne({ userId: tenantUserId });
        if (!house) {
            throw new NotFoundError(MESSAGES.AUCTION_HOUSE_NOT_FOUND);
        }
        const houseId = house._id.toString();
        const { start, end } = this.resolveRange(startDate, endDate);
        const [totalRevenue, refundRate, trend, bySourceRaw] = await Promise.all([
            this._revenueRepo.getTenantTotalRevenue(houseId, start, end),
            this._revenueRepo.getTenantRefundRate(houseId, start, end),
            this._revenueRepo.getTenantRevenueTrend(houseId, start, end, granularity),
            this._revenueRepo.getTenantRevenueBySource(houseId, start, end),
        ]);
        const bySource = bySourceRaw.map(s => ({ source: s.source as "order" | "slot_booking", amount: s.amount, count: s.count }));
        return {
            range: { startDate: start.toISOString(), endDate: end.toISOString() },
            totalRevenue,
            refundRate,
            trend,
            bySource,
        };

    }
    async getTenantIncomingRevenueList(tenantUserId: string, startDate: string, endDate: string, page: number, limit: number): Promise<IGenericPaginatedResposnse<TenantIncomingRevenueRowDTO>> {
         const house = await this._houseRepo.findOne({ userId: tenantUserId });
        if (!house) {
            throw new NotFoundError(MESSAGES.AUCTION_HOUSE_NOT_FOUND);
        }
        const houseId = house._id.toString();
        const start = new Date(startDate);
        const end = new Date(endDate);
        const { docs, total } = await this._revenueRepo.getTenantIncomingRevenueList(houseId, start, end, page, limit);

        return {
            data: RevenueMapper.toIncomingTenantRevenueList(docs),
            pagination: {
                totalItems: total,
                itemsPerPage: limit,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1,
            }
        };
    }
}