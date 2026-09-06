import { BaseRepository } from "./Base.repository";
import { IPaymentRequestRepository } from "../interfaces/IPaymentRequest.repository";
import { PaymentRequest } from "../../models/paymentRequest.model";
import { IPaymentRequestDocument } from "../../types/paymentRequest.types";
import { CreatePaymentRequestDTO } from "../../dtos/user.dto/paymentRequest.dto";
import { Types } from "mongoose";
import { PaymentRequestStatus } from "../../types/paymentRequest.types";


export class PaymentRequestRepository extends BaseRepository<IPaymentRequestDocument> implements IPaymentRequestRepository {
    constructor() {
        super(PaymentRequest)
    }
    async createPaymentRequest(data: CreatePaymentRequestDTO): Promise<IPaymentRequestDocument> {
        return await this.model.create({
            tenantId: new Types.ObjectId(data.tenantId),
            auctionId: new Types.ObjectId(data.auctionId),
            bidderId: new Types.ObjectId(data.bidderId),
            amount: data.amount,
            currency: data.currency || "INR",
            status: PaymentRequestStatus.PENDING,
            expiresAt: data.expiresAt,
        })
    }
    async findByAuctionId(auctionId: string): Promise<IPaymentRequestDocument | null> {
        return await this.model.findOne({
            auctionId: new Types.ObjectId(auctionId),
        })
            .lean<IPaymentRequestDocument>()
            .exec();
    }
    async findByRequestId(id: string): Promise<IPaymentRequestDocument | null> {
        return await this.model.findById(id)
            .lean<IPaymentRequestDocument>()
            .exec();
    }

    async updateStatus(
        id: string,
        status: PaymentRequestStatus,
        orderId?: string
    ): Promise<IPaymentRequestDocument | null> {
        const updatePayload: Record<string, unknown> = { status };
        if (orderId) {
            updatePayload.orderId = new Types.ObjectId(orderId);
        }
        if (status === PaymentRequestStatus.COMPLETED) {
            updatePayload.paidAt = new Date();
        }

        return await this.model.findByIdAndUpdate(
            id,
            { $set: updatePayload },
            { new: true }
        )
            .lean<IPaymentRequestDocument>()
            .exec();
    }

}