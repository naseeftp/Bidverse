export type RevenueGranularity = "day" | "week" | "month";

export interface TenantRevenueTrendPointDTO {
    date: string;
    revenue: number;
}
export interface TenantRevenueBySourceDTO {
    source: "order" | "slot_booking";
    amount: number; count: number;
}

export interface TenantRevenueBreakdownResponseDTO {
    range: { startDate: string; endDate: string };
    totalRevenue: number;
    refundRate: number;
    trend: TenantRevenueTrendPointDTO[];
    bySource: TenantRevenueBySourceDTO[];
}

export interface TenantIncomingRevenueRowDTO {
    id: string;
    date: string;
    source: "order" | "slot_booking" | "unknown";
    auctionTitle?: string;
    amount: number;
    status: string;
}