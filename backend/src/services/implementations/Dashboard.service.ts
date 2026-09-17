import { IDashboardService } from "../interface/IDashboard.service";
import { IDashboardRepository } from "../../repositories/interfaces/IDashboard.repository";
import { DashboardResponseDTO } from "../../dtos/admin.dto/dashboard.dto";

export class DashboardService implements IDashboardService {
    constructor(
        private _dashboardRepo: IDashboardRepository
    ) { }
    async getAdminDashboard(): Promise<DashboardResponseDTO> {
        const [
            totalRevenue,
            paymentSuccessRate,
            revenueTrend,
            auctionHouseFunnel,
            auctionItemFunnel,
            orderStatusBreakdown,
            returnRequestStats,
            topAuctionHouses,
            totalUsers,
            totalAuctionHouses,
            verifiedAuctionHouses,
            activeAuctions,
            totalOrders,
            escrowBreakdown
        ] = await Promise.all([
            this._dashboardRepo.getTotalRevenue(),
            this._dashboardRepo.getPaymentSuccessRate(),
            this._dashboardRepo.getRevenueTrend(30),
            this._dashboardRepo.getAuctionHouseFunnel(),
            this._dashboardRepo.getAuctionItemFunnel(),
            this._dashboardRepo.getOrderStatusBreakdown(),
            this._dashboardRepo.getReturnRequestStats(),
            this._dashboardRepo.getTopAuctionHouses(5),
            this._dashboardRepo.getTotalUsers(),
            this._dashboardRepo.getTotalAuctionHouses(),
            this._dashboardRepo.getVerifiedAuctionHouseCount(),
            this._dashboardRepo.getActiveAuctionCount(),
            this._dashboardRepo.getTotalOrders(),
            this._dashboardRepo.getEscrowStatusBreakdown()
        ])
        return {
            overview: {
                totalRevenue,
                totalUsers,
                totalAuctionHouses,
                verifiedAuctionHouses,
                activeAuctions,
                totalOrders,
                pendingReturnRequests: returnRequestStats.pending,
                paymentSuccessRate,
            },
            revenueTrend,
            auctionHouseFunnel,
            auctionItemFunnel,
            orderStatusBreakdown,
            returnRequestStats,
            topAuctionHouses,
            escrowBreakdown
        };
    }


}