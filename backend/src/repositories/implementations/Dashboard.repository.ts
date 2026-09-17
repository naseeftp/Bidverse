import { IDashboardRepository } from "../interfaces/IDashboard.repository";
import { Transaction } from "../../models/transaction.model";
import { TransactionPartyType } from "../../constants/transaction.constant";
import { Payment } from "../../models/payment.model";
import { PaymentStatus, EscrowStatus } from "../../constants/payment.constants";
import { AuctionHouse } from "../../models/auctionHouse.model";
import { AuctionItem } from "../../models/auctionItem.model";
import { Order } from "../../models/order.model";
import { ReturnRequestStatus } from "../../constants/order.constant";
import UserModel from "../../models/user.model";
import { AuctionItemStatus } from "../../constants/constants";

export class DashboardRepository implements IDashboardRepository {

    async getTotalRevenue(): Promise<number> {
        const [result] = await Transaction.aggregate([
            { $match: { partyType: TransactionPartyType.PLATFORM } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
        return result?.total ?? 0
    }
    async getPaymentSuccessRate(): Promise<number> {
        const [result] = await Payment.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    paid: {
                        $sum: { $cond: [{ $eq: ["$status", PaymentStatus.PAID] }, 1, 0] }
                    }
                }
            }
        ]);
        if (!result || result.total === 0) return 0;
        return Math.round((result.paid / result.total) * 100);
    }
    async getRevenueTrend(days: number): Promise<{ date: string; revenue: number }[]> {
        const since = new Date();
        since.setDate(since.getDate() - days);
        const results = await Transaction.aggregate([
            {
                $match: {
                    partyType: TransactionPartyType.PLATFORM,
                    createdAt: { $gte: since }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return results.map(r => ({ date: r._id, revenue: r.revenue }));

    }
    async getAuctionHouseFunnel(): Promise<{ status: string; count: number; }[]> {
        const results = await AuctionHouse.aggregate([
            {
                $group: { _id: '$status', count: { $sum: 1 } }
            }
        ])
        return results.map(r => ({ status: r._id, count: r.count }));
    }
    async getAuctionItemFunnel(): Promise<{ status: string; count: number; }[]> {
        const results = await AuctionItem.aggregate([
            {
                $group: { _id: '$status', count: { $sum: 1 } }
            }
        ])
        return results.map(r => ({ status: r._id, count: r.count }));

    }
    async getOrderStatusBreakdown(): Promise<{ status: string; count: number }[]> {
        const results = await Order.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        return results.map(r => ({ status: r._id, count: r.count }));
    }
    async getReturnRequestStats(): Promise<{ pending: number; approved: number; rejected: number }> {
        const [result] = await Order.aggregate([
            { $match: { returnRequest: { $exists: true } } },
            {
                $group: {
                    _id: null,
                    pending: { $sum: { $cond: [{ $eq: ["$returnRequest.status", ReturnRequestStatus.PENDING] }, 1, 0] } },
                    approved: { $sum: { $cond: [{ $eq: ["$returnRequest.status", ReturnRequestStatus.APPROVED] }, 1, 0] } },
                    rejected: { $sum: { $cond: [{ $eq: ["$returnRequest.status", ReturnRequestStatus.REJECTED] }, 1, 0] } },
                }
            }
        ]);
        return result
            ? { pending: result.pending, approved: result.approved, rejected: result.rejected }
            : { pending: 0, approved: 0, rejected: 0 };
    }
    async getTopAuctionHouses(limit: number): Promise<{ houseId: string; houseName: string; totalRevenue: number; orderCount: number }[]> {
        const results = await Transaction.aggregate([
            { $match: { partyType: TransactionPartyType.AUCTION_HOUSE } },
            {
                $group: {
                    _id: "$auctionHouseId",
                    totalRevenue: { $sum: "$amount" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: limit },
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
    async getTotalUsers(): Promise<number> {
        return UserModel.countDocuments({ role: 'user' })
    }
    async getTotalAuctionHouses(): Promise<number> {
        return AuctionHouse.countDocuments()
    }
    async getVerifiedAuctionHouseCount(): Promise<number> {
        return AuctionHouse.countDocuments({ isVerified: true });
    }
    getActiveAuctionCount(): Promise<number> {
        return AuctionItem.countDocuments({ status: AuctionItemStatus.SCHEDULED });
    }
    async getTotalOrders(): Promise<number> {
        return Order.countDocuments()
    }

    async getEscrowStatusBreakdown(): Promise<{ status: string; count: number; totalAmount: number }[]> {
        const results = await Payment.aggregate([
            {
                $match: {
                    escrowStatus: { $in: [EscrowStatus.HELD, EscrowStatus.RELEASED, EscrowStatus.REFUNDED] }
                }
            },
            {
                $group: {
                    _id: "$escrowStatus",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$amount" }
                }
            }
        ]);
        return results.map(r => ({ status: r._id, count: r.count, totalAmount: r.totalAmount }));

    }

}