export interface DashboardOverviewDTO {
    totalRevenue: number;
    totalUsers: number;
    totalAuctionHouses: number;
    verifiedAuctionHouses: number;
    activeAuctions: number;
    totalOrders: number;
    pendingReturnRequests: number;
    paymentSuccessRate: number;
}

export interface RevenueTrendPointDTO {
    date: string;
    revenue: number;
}
export interface StatusBreakdownDTO {
    status: string;
    count: number;
}
export interface TopAuctionHouseDTO {
    houseId: string;
    houseName: string;
    totalRevenue: number;
    orderCount: number;
}
export interface EscrowStatusBreakdownDTO {
    status: string;
    count: number;
    totalAmount: number;
}
export interface DashboardResponseDTO {
    overview: DashboardOverviewDTO;
    revenueTrend: RevenueTrendPointDTO[];
    auctionHouseFunnel: StatusBreakdownDTO[];
    auctionItemFunnel: StatusBreakdownDTO[];
    orderStatusBreakdown: StatusBreakdownDTO[];
    returnRequestStats: { pending: number; approved: number; rejected: number };
    topAuctionHouses: TopAuctionHouseDTO[];
    escrowBreakdown: EscrowStatusBreakdownDTO[];
}


