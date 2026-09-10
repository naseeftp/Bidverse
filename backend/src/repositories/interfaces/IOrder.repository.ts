import { IBaseRepository } from "./IBase.repository";
import { IOrderDocument } from "../../types/order.type";
import { CreateOrderInputDTO } from "../../dtos/user.dto/order.dto";

export interface IOrderRepository extends IBaseRepository<IOrderDocument> {
    createOrder(data: CreateOrderInputDTO): Promise<IOrderDocument>
    findByPaymentRequestId(paymentRequestId: string): Promise<IOrderDocument | null>;
}