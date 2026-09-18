import { IDashboardService } from "../interface/IDashboard.service";
import { IDashboardRepository } from "../../repositories/interfaces/IDashboard.repository";
import { DashboardResponseDTO } from "../../dtos/admin.dto/dashboard.dto";
import { IAuctionHouseRepository } from "../../repositories/interfaces/IAuctionHouse.repository";
import { TenantDashboardResponseDTO } from "../../dtos/auctionHouse.dto/dashboard.dto";
import { NotFoundError } from "../../errors/AppError";
import { MESSAGES } from "../../constants/constants";

export class DashboardService implements IDashboardService {
    constructor(
        private _dashboardRepo: IDashboardRepository,
        private _houseRepo:IAuctionHouseRepository
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
 async getTenantDashboard(tenantUserId: string): Promise<TenantDashboardResponseDTO> {
     const house=await this._houseRepo.findOne({userId:tenantUserId});
     if(!house){
        throw new NotFoundError(MESSAGES.AUCTION_HOUSE_NOT_FOUND)
     }
     const houseId=house._id.toString();
          const [
            totalRevenue,
            revenueTrend,
            listingStatusBreakdown,
            orderStatusBreakdown,
            returnRequestStats,
            activeAuctions,
            totalListings,
            totalOrders,
        ] = await Promise.all([
            this._dashboardRepo.getTenantRevenue(tenantUserId),
            this._dashboardRepo.getTenantRevenueTrend(tenantUserId, 30),
            this._dashboardRepo.getTenantListingStatusBreakdown(houseId),
            this._dashboardRepo.getTenantOrderStatusBreakdown(houseId),
            this._dashboardRepo.getTenantReturnRequestStats(houseId),
            this._dashboardRepo.getTenantActiveAuctionCount(houseId),
            this._dashboardRepo.getTenantTotalListings(houseId),
            this._dashboardRepo.getTenantTotalOrders(houseId),
        ])
         return {
            overview: {
                totalRevenue,
                totalOrders,
                activeAuctions,
                totalListings,
                pendingReturnRequests: returnRequestStats.pending,
            },
            revenueTrend,
            listingStatusBreakdown,
            orderStatusBreakdown,
            returnRequestStats,
        };
 }

}