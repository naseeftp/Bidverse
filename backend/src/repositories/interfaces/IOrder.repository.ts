import { IBaseRepository } from "./IBase.repository";
import { IOrderDocument,IOrderAggregateDOC} from "../../types/order.type";
import { CreateOrderInputDTO } from "../../dtos/user.dto/order.dto";

export interface IOrderRepository extends IBaseRepository<IOrderDocument> {
    createOrder(data: CreateOrderInputDTO): Promise<IOrderDocument>
    findByPaymentRequestId(paymentRequestId: string): Promise<IOrderDocument | null>;
    getUserOrders(userId:string,page:number,limit:number,status?:string):Promise<{docs:IOrderAggregateDOC[],total:number}>
}