import { IBaseRepository } from "./IBase.repository";
import { IOrderDocument,IOrderAggregateDOC, IOrderDetailsAggregateDoc,IOrderTenantAggregateDOC} from "../../types/order.type";
import { CreateOrderInputDTO } from "../../dtos/user.dto/order.dto";

export interface IOrderRepository extends IBaseRepository<IOrderDocument> {
    createOrder(data: CreateOrderInputDTO): Promise<IOrderDocument>
    findByPaymentRequestId(paymentRequestId: string): Promise<IOrderDocument | null>;
    getUserOrders(userId:string,page:number,limit:number,status?:string,search?:string):Promise<{docs:IOrderAggregateDOC[],total:number}>
    findOrderDetailsById(orderId:string):Promise<IOrderDetailsAggregateDoc|null>
    getTenantOrders(tenantId:string,page:number,limit:number,status?:string,search?:string):Promise<{docs:IOrderTenantAggregateDOC[],total:number}>
}