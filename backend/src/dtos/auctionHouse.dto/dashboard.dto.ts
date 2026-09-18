export interface TenantDashboardOverviewDTO {
    totalRevenue: number;
    totalOrders: number;
    activeAuctions: number;
    totalListings: number;
    pendingReturnRequests: number;
}

export interface RevenueTrendPointDTO {
    date: string;
    revenue: number;
}
export interface StatusBreakdownDTO {
    status: string;
    count: number;
}

export interface TenantDashboardResponseDTO {
    overview: TenantDashboardOverviewDTO;
    revenueTrend: RevenueTrendPointDTO[];
    listingStatusBreakdown: StatusBreakdownDTO[];
    orderStatusBreakdown: StatusBreakdownDTO[];
    returnRequestStats: { pending: number; approved: number; rejected: number };
}