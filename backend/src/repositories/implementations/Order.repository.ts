import { IOrderDocument, IOrderAggregateDOC } from "../../types/order.type";
import { IOrderRepository } from "../interfaces/IOrder.repository";
import { BaseRepository } from "./Base.repository";
import { Order } from "../../models/order.model";
import { PipelineStage, Types } from "mongoose";
import { CreateOrderInputDTO } from "../../dtos/user.dto/order.dto";

export class OrderRepository extends BaseRepository<IOrderDocument> implements IOrderRepository {
    constructor() {
        super(Order)
    }
    async createOrder(data: CreateOrderInputDTO): Promise<IOrderDocument> {
        return await this.model.create(
            {
                ...data,
                auctionItemId: new Types.ObjectId(data.auctionItemId),
                paymentRequestId: new Types.ObjectId(data.paymentRequestId),
                tenantId: new Types.ObjectId(data.tenantId),
                buyerId: new Types.ObjectId(data.buyerId),
                addressId: new Types.ObjectId(data.addressId)
            }
        )
    }
    async findByPaymentRequestId(paymentRequestId: string): Promise<IOrderDocument | null> {
        return await this.model.findOne({ paymentRequestId: new Types.ObjectId(paymentRequestId) })
            .lean<IOrderDocument>()
            .exec();
    }

    async getUserOrders(userId: string, page: number, limit: number, status?: string, search?: string): Promise<{ docs: IOrderAggregateDOC[], total: number }> {
        const skip = (page - 1) * limit;

        const initialMatch: Record<string, unknown> = {
            buyerId: new Types.ObjectId(userId)
        }
        if (status && status != 'ALL') {
            initialMatch.status = status
        }
        const pipeline: PipelineStage[] = [
            { $match: initialMatch },
            {
                $lookup: {
                    from: 'auctionitems',
                    localField: 'auctionItemId',
                    foreignField: '_id',
                    pipeline: [{ $project: { _id: 1, title: 1, images: 1 } }],
                    as: 'auction'
                }
            },
            { $unwind: { path: '$auction', preserveNullAndEmptyArrays: true } }
        ]
        if (search && search.trim() !== '') {
            const cleanSearch = search.trim();
            const searchConditions: Record<string, unknown>[] = [
                { 'auction.title': { $regex: cleanSearch, $options: 'i' } },
                { orderNumber: { $regex: cleanSearch, $options: 'i' } }
            ]
            if (Types.ObjectId.isValid(cleanSearch)) {
                searchConditions.push({ _id: new Types.ObjectId(cleanSearch) });
            }
            pipeline.push({
                $match: {
                    $or: searchConditions
                }
            })
        }
        pipeline.push({
            $facet: {
                docs: [
                    { $sort: { createdAt: -1 } },
                    { $skip: skip },
                    { $limit: limit }
                ],
                total: [{ $count: 'count' }]
            }
        });
        const [result] = await this.model.aggregate(pipeline);
        return {
            docs: result?.docs || [],
            total: result?.total?.[0]?.count || 0
        };
    }

}