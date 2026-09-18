export interface IDashboardRepository {
    getTotalRevenue(): Promise<number>;
    getPaymentSuccessRate(): Promise<number>;
    getRevenueTrend(days: number): Promise<{ date: string; revenue: number }[]>;
    getAuctionHouseFunnel(): Promise<{ status: string; count: number }[]>;
    getAuctionItemFunnel(): Promise<{ status: string; count: number }[]>;
    getOrderStatusBreakdown(): Promise<{ status: string; count: number }[]>;
    getReturnRequestStats(): Promise<{ pending: number; approved: number; rejected: number }>;
    getTopAuctionHouses(limit: number): Promise<{ houseId: string; houseName: string; totalRevenue: number; orderCount: number }[]>
    getTotalUsers(): Promise<number>;
    getTotalAuctionHouses(): Promise<number>;
    getVerifiedAuctionHouseCount(): Promise<number>;
    getActiveAuctionCount(): Promise<number>;
    getTotalOrders(): Promise<number>;
    getEscrowStatusBreakdown(): Promise<{ status: string; count: number; totalAmount: number }[]>;

    getTenantRevenue(houseId: string): Promise<number>;
    getTenantRevenueTrend(houseId: string, days: number): Promise<{ date: string; revenue: number }[]>;
    getTenantListingStatusBreakdown(houseId: string): Promise<{ status: string; count: number }[]>;
    getTenantOrderStatusBreakdown(houseId: string): Promise<{ status: string; count: number }[]>;
    getTenantReturnRequestStats(houseId: string): Promise<{ pending: number; approved: number; rejected: number }>;
    getTenantActiveAuctionCount(houseId: string): Promise<number>;
    getTenantTotalListings(houseId: string): Promise<number>;
    getTenantTotalOrders(houseId: string): Promise<number>;
}