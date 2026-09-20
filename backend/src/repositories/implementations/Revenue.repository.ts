import { Transaction } from "../../models/transaction.model";
import { Order } from "../../models/order.model";
import { TransactionPartyType, TransactionPurpose } from "../../constants/transaction.constant";
import { OrderStatus } from "../../constants/order.constant";
import { IRevenueRepository, RevenueGranularity } from "../interfaces/IRevenue.repository";
import { Types } from "mongoose";
const GRANULARITY_FORMAT: Record<RevenueGranularity, string> = {
    day: "%Y-%m-%d",
    week: "%G-W%V",
    month: "%Y-%m",
};

export class RevenueRepository implements IRevenueRepository {
    async getTotalCommission(start: Date, end: Date): Promise<number> {
        const [result] = await Transaction.aggregate([
            {
                $match: { partyType: TransactionPartyType.PLATFORM, createdAt: { $gte: start, $lte: end } }
            },
            {
                $group: { _id: null, total: { $sum: '$amount' } }
            }
        ])
        return result?.total ?? 0;
    }
    async getTotalRefunded(start: Date, end: Date): Promise<number> {
        const [result] = await Transaction.aggregate([
            { $match: { purpose: TransactionPurpose.REFUND, createdAt: { $gte: start, $lte: end } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
        return result?.total ?? 0
    }
    async getRefundRate(start: Date, end: Date): Promise<number> {
        const [result] = await Order.aggregate([
            {
                $match: {
                    updatedAt: { $gte: start, $lte: end },
                    status: { $in: [OrderStatus.COMPLETED, OrderStatus.REFUNDED] }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    refunded: { $sum: { $cond: [{ $eq: ["$status", OrderStatus.REFUNDED] }, 1, 0] } }
                }
            }
        ]);
        if (!result || result.total === 0) return 0;
        return Math.round((result.refunded / result.total) * 100);
    }
    async getRevenueTrend(start: Date, end: Date, granularity: RevenueGranularity): Promise<{ date: string; commission: number; }[]> {
        const results = await Transaction.aggregate([
            { $match: { partyType: TransactionPartyType.PLATFORM, createdAt: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: { $dateToString: { format: GRANULARITY_FORMAT[granularity], date: "$createdAt" } },
                    commission: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        return results.map(r => ({ date: r._id, commission: r.commission }));
    }
    async getRevenueBySource(start: Date, end: Date): Promise<{ source: string; amount: number; count: number }[]> {
        const results = await Transaction.aggregate([
            { $match: { partyType: TransactionPartyType.PLATFORM, createdAt: { $gte: start, $lte: end } } },
            {
                $lookup: {
                    from: "payments",
                    localField: "paymentId",
                    foreignField: "_id",
                    pipeline: [{ $project: { type: 1 } }],
                    as: "payment"
                }
            },
            { $unwind: "$payment" },
            { $group: { _id: "$payment.type", amount: { $sum: "$amount" }, count: { $sum: 1 } } }
        ]);
        return results.map(r => ({ source: r._id, amount: r.amount, count: r.count }));
    }
    async getRevenueByHouse(start: Date, end: Date): Promise<{ houseId: string; houseName: string; totalRevenue: number; orderCount: number }[]> {
        const results = await Transaction.aggregate([
            { $match: { partyType: TransactionPartyType.AUCTION_HOUSE, createdAt: { $gte: start, $lte: end } } },
            { $group: { _id: "$auctionHouseId", totalRevenue: { $sum: "$amount" }, orderCount: { $sum: 1 } } },
            { $sort: { totalRevenue: -1 } },
            {
                $lookup: {
                    from: "auctionhouses",
                    localField: "_id",
                    foreignField: "_id",
                    pipeline: [{ $project: { name: 1 } }],
                    as: "house"
                }
            },
            { $unwind: "$house" },
        ]);
        return results.map(r => ({
            houseId: r._id.toString(),
            houseName: r.house.name,
            totalRevenue: r.totalRevenue,
            orderCount: r.orderCount
        }));
    }
    async getIncomingRevenueList(start: Date, end: Date, page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [result] = await Transaction.aggregate([
            { $match: { partyType: TransactionPartyType.PLATFORM, createdAt: { $gte: start, $lte: end } } },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "payments",
                    localField: "paymentId",
                    foreignField: "_id",
                    pipeline: [{ $project: { type: 1, status: 1 } }],
                    as: "payment"
                }
            },
            { $unwind: { path: "$payment", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "auctionitems",
                    localField: "auctionItemId",
                    foreignField: "_id",
                    pipeline: [{ $project: { title: 1, houseId: 1 } }],
                    as: "auction"
                }
            },
            { $unwind: { path: "$auction", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "auctionhouses",
                    localField: "auction.houseId",
                    foreignField: "_id",
                    pipeline: [{ $project: { name: 1 } }],
                    as: "house"
                }
            },
            { $unwind: { path: "$house", preserveNullAndEmptyArrays: true } },
            {
                $facet: {
                    docs: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 1,
                                createdAt: 1,
                                amount: 1,
                                status: 1,
                                source: "$payment.type",
                                auctionTitle: "$auction.title",
                                houseName: "$house.name",
                            }
                        }
                    ],
                    totalCount: [{ $count: "count" }]
                }
            }
        ]);

        const docs = (result?.docs ?? []).map((d: any) => ({
            id: d._id.toString(),
            date: d.createdAt,
            source: d.source ?? "unknown",
            auctionTitle: d.auctionTitle,
            houseName: d.houseName,
            amount: d.amount,
            status: d.status,
        }));

        return { docs, total: result?.totalCount?.[0]?.count ?? 0 };
    }
    //tenant
    async getTenantTotalRevenue(houseId: string, start: Date, end: Date): Promise<number> {
        const [result] = await Transaction.aggregate([
            {
                $match: {
                    partyType: TransactionPartyType.AUCTION_HOUSE,
                    auctionHouseId: new Types.ObjectId(houseId),
                    createdAt: { $gte: start, $lte: end }
                }
            },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        return result?.total ?? 0;
    }
    async getTenantRefundRate(houseId: string, start: Date, end: Date): Promise<number> {
        const [result] = await Order.aggregate([
            {
                $match: {
                    tenantId: new Types.ObjectId(houseId),
                    updatedAt: { $gte: start, $lte: end },
                    status: { $in: [OrderStatus.COMPLETED, OrderStatus.REFUNDED] }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    refunded: { $sum: { $cond: [{ $eq: ["$status", OrderStatus.REFUNDED] }, 1, 0] } }
                }
            }
        ]);
        if (!result || result.total === 0) return 0;
        return Math.round((result.refunded / result.total) * 100);
    }
    async getTenantRevenueTrend(houseId: string, start: Date, end: Date, granularity: RevenueGranularity): Promise<{ date: string; revenue: number }[]> {
        const results = await Transaction.aggregate([
            {
                $match: {
                    partyType: TransactionPartyType.AUCTION_HOUSE,
                    auctionHouseId: new Types.ObjectId(houseId),
                    createdAt: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: GRANULARITY_FORMAT[granularity], date: "$createdAt" } },
                    revenue: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        return results.map(r => ({ date: r._id, revenue: r.revenue }));
    }
    async getTenantRevenueBySource(houseId: string, start: Date, end: Date): Promise<{ source: string; amount: number; count: number }[]> {
        const results = await Transaction.aggregate([
            {
                $match: {
                    partyType: TransactionPartyType.AUCTION_HOUSE,
                    auctionHouseId: new Types.ObjectId(houseId),
                    createdAt: { $gte: start, $lte: end }
                }
            },
            {
                $lookup: {
                    from: "payments",
                    localField: "paymentId",
                    foreignField: "_id",
                    pipeline: [{ $project: { type: 1 } }],
                    as: "payment"
                }
            },
            { $unwind: "$payment" },
            { $group: { _id: "$payment.type", amount: { $sum: "$amount" }, count: { $sum: 1 } } }
        ]);
        return results.map(r => ({ source: r._id, amount: r.amount, count: r.count }));
    }
    async getTenantIncomingRevenueList(houseId: string, start: Date, end: Date, page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [result] = await Transaction.aggregate([
            {
                $match: {
                    partyType: TransactionPartyType.AUCTION_HOUSE,
                    auctionHouseId: new Types.ObjectId(houseId),
                    createdAt: { $gte: start, $lte: end }
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "payments",
                    localField: "paymentId",
                    foreignField: "_id",
                    pipeline: [{ $project: { type: 1 } }],
                    as: "payment"
                }
            },
            { $unwind: { path: "$payment", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "auctionitems",
                    localField: "auctionItemId",
                    foreignField: "_id",
                    pipeline: [{ $project: { title: 1 } }],
                    as: "auction"
                }
            },
            { $unwind: { path: "$auction", preserveNullAndEmptyArrays: true } },
            {
                $facet: {
                    docs: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 1,
                                createdAt: 1,
                                amount: 1,
                                status: 1,
                                source: "$payment.type",
                                auctionTitle: "$auction.title",
                            }
                        }
                    ],
                    totalCount: [{ $count: "count" }]
                }
            }
        ]);

        const docs = (result?.docs ?? []).map((d: any) => ({
            id: d._id.toString(),
            date: d.createdAt,
            source: d.source ?? "unknown",
            auctionTitle: d.auctionTitle,
            amount: d.amount,
            status: d.status,
        }));

        return { docs, total: result?.totalCount?.[0]?.count ?? 0 };
    }
}