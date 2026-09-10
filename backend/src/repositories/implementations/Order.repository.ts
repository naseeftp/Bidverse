import { IOrderDocument } from "../../types/order.type";
import { IOrderRepository } from "../interfaces/IOrder.repository";
import { BaseRepository } from "./Base.repository";
import { Order } from "../../models/order.model";
import { Types } from "mongoose";
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
}