export type RevenueGranularity = "day" | "week" | "month";

export interface IRevenueRepository {
    getTotalCommission(start: Date, end: Date): Promise<number>;
    getTotalRefunded(start: Date, end: Date): Promise<number>;
    getRefundRate(start: Date, end: Date): Promise<number>;
    getRevenueTrend(start: Date, end: Date, granularity: RevenueGranularity): Promise<{ date: string; commission: number }[]>;
    getRevenueBySource(start: Date, end: Date): Promise<{ source: string; amount: number; count: number }[]>;
    getRevenueByHouse(start: Date, end: Date): Promise<{ houseId: string; houseName: string; totalRevenue: number; orderCount: number }[]>;
    getIncomingRevenueList(
        start: Date,
        end: Date,
        page: number,
        limit: number
    ): Promise<{
        docs: { id: string; date: Date; source: string; auctionTitle?: string; houseName?: string; amount: number; status: string }[];
        total: number;
    }>;
    getTenantTotalRevenue(houseId: string, start: Date, end: Date): Promise<number>;
    getTenantRefundRate(houseId: string, start: Date, end: Date): Promise<number>;
    getTenantRevenueTrend(houseId: string, start: Date, end: Date, granularity: RevenueGranularity): Promise<{ date: string; revenue: number }[]>;
    getTenantRevenueBySource(houseId: string, start: Date, end: Date): Promise<{ source: string; amount: number; count: number }[]>;
    getTenantIncomingRevenueList(
        houseId: string,
        start: Date,
        end: Date,
        page: number,
        limit: number
    ): Promise<{
        docs: { id: string; date: Date; source: string; auctionTitle?: string; amount: number; status: string }[];
        total: number;
    }>;
}

export interface RawIncomingRevenueDoc {
    _id: { toString(): string };
    createdAt: Date;
    amount: number;
    status: string;
    source?: string;
    auctionTitle?: string;
    houseName?: string;
}
export interface RawTenantIncomingRevenueDoc {
    _id: { toString(): string };
    createdAt: Date;
    amount: number;
    status: string;
    source?: string;
    auctionTitle?: string;
}