import { BaseRepository } from "./Base.repository";
import { IPaymentRequestRepository } from "../interfaces/IPaymentRequest.repository";
import { PaymentRequest } from "../../models/paymentRequest.model";
import { IPaymentRequestAggregateDoc, IPaymentRequestDocument } from "../../types/paymentRequest.types";
import { CreatePaymentRequestDTO } from "../../dtos/user.dto/paymentRequest.dto";
import { Types } from "mongoose";
import { PaymentRequestStatus } from "../../types/paymentRequest.types";
import { IPopulatedPaymentRequest, IPopulatedAuctionItem } from "../../types/paymentRequest.types";


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
  async getUserPaymentRequests(userId: string, page: number, limit: number, status?: string): Promise<{ docs: IPaymentRequestAggregateDoc[], total: number }> {
    const matchStage: Record<string, unknown> = {
      bidderId: new Types.ObjectId(userId)
    }
    if (status) {
      matchStage.status = status
    };
    const skip = (page - 1) * limit;
    const [result] = await this.model.aggregate([
      {
        $facet: {
          docs: [
            { $match: matchStage },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: 'auctionitems',
                localField: 'auctionId',
                foreignField: '_id',
                pipeline: [{ $project: { title: 1, images: 1 } }],
                as: 'auction'
              }
            },
            { $unwind: { path: '$auction', preserveNullAndEmptyArrays: true } }
          ],
          total: [{ $match: matchStage }, { $count: 'count' }]
        }
      }
    ]);
    return {
      docs: result.docs || [],
      total: result?.total?.[0]?.count || 0
    }
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

  async findWithAuctionDetails(paymentRequestId: string): Promise<IPopulatedPaymentRequest | null> {
    const document = await this.model.findById(paymentRequestId)
      .populate<{ auctionId: IPopulatedAuctionItem }>({
        path: 'auctionId',
        select: "title description images currency startingPrice shippingCost",
      })
      .exec()
    return document as IPopulatedPaymentRequest | null
  }


}