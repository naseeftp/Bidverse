import { IOrderDocument, IOrderAggregateDOC } from "../../types/order.type";
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

    async getUserOrders(userId: string, page: number, limit: number, status?: string): Promise<{ docs: IOrderAggregateDOC[], total: number }> {
        const matchStage: Record<string, unknown> = {
            buyerId: new Types.ObjectId(userId)
        }
        if(status){
            matchStage.status=status
        }
        const skip=(page-1)*limit;
        const [result]=await this.model.aggregate([
           {
            $facet:{
                docs:[
                  {$match:matchStage},
                  {$sort:{createdAt:-1}},
                  {$skip:skip},
                  {$limit:limit},
                  {
                    $lookup:{
                        from:'auctionitems',
                        localField:'auctionItemId',
                        foreignField:'_id',
                        pipeline:[{$project:{_id:1,title:1,images:1}}],
                        as:'auction'
                    }
                  },
                  {$unwind:{path:'$auction',preserveNullAndEmptyArrays:true}}
                ],
                total:[{$match:matchStage},{$count:'count'}]
            }
           } 
        ]);
        return{
            docs:result.docs||[],
            total:result?.total?.[0]?.count||0
        }
    }

}