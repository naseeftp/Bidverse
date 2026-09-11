import { IBaseRepository } from "./IBase.repository";
import { IOrderDocument,IOrderAggregateDOC, IOrderDetailsAggregateDoc} from "../../types/order.type";
import { CreateOrderInputDTO } from "../../dtos/user.dto/order.dto";

export interface IOrderRepository extends IBaseRepository<IOrderDocument> {
    createOrder(data: CreateOrderInputDTO): Promise<IOrderDocument>
    findByPaymentRequestId(paymentRequestId: string): Promise<IOrderDocument | null>;
    getUserOrders(userId:string,page:number,limit:number,status?:string,search?:string):Promise<{docs:IOrderAggregateDOC[],total:number}>
    findOrderDetailsById(orderId:string,buyerId:string):Promise<IOrderDetailsAggregateDoc|null>
}