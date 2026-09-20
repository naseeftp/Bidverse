
export type RevenueGranularity = "day" | "week" | "month";

export interface RevenueTrendPointDTO {
    date: string;
    commission: number;
}
export interface RevenueBySourceDTO {
    source: "order" | "slot_booking";
    amount: number; count: number;
}
export interface HouseRevenueRowDTO {
    houseId: string;
    houseName: string;
    totalRevenue: number;
    orderCount: number;
    sharePercent: number;
}

export interface RevenueBreakdownResponseDTO {
    range: { startDate: string; endDate: string };
    totalCommission: number;
    totalRefunded: number;
    refundRate: number;
    trend: RevenueTrendPointDTO[];
    bySource: RevenueBySourceDTO[];
    byHouse: HouseRevenueRowDTO[];
}

export interface IncomingRevenueRowDTO {
    id: string;
    date: string;
    source: "order" | "slot_booking" | "unknown";
    auctionTitle?: string;
    houseName?: string;
    amount: number;
    status: string;
}

export interface IncomingRevenueListResponseDTO {
    data: IncomingRevenueRowDTO[];
    pagination: {
        totalItems: number;
        itemsPerPage: number;
        currentPage: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}