import { IBaseRepository } from "./IBase.repository";
import { IOrderDocument, IOrderAggregateDOC, IOrderDetailsAggregateDoc, IOrderTenantAggregateDOC, IOrderAdminAggregateDOC, IReturnRequest } from "../../types/order.type";
import { CreateOrderInputDTO } from "../../dtos/user.dto/order.dto";
import { OrderStatus ,ReturnRequestStatus} from "../../constants/order.constant";

export interface IOrderRepository extends IBaseRepository<IOrderDocument> {
    createOrder(data: CreateOrderInputDTO): Promise<IOrderDocument>
    findByPaymentRequestId(paymentRequestId: string): Promise<IOrderDocument | null>;
    getUserOrders(userId: string, page: number, limit: number, status?: string, search?: string): Promise<{ docs: IOrderAggregateDOC[], total: number }>
    findOrderDetailsById(orderId: string): Promise<IOrderDetailsAggregateDoc | null>
    getTenantOrders(tenantId: string, page: number, limit: number, status?: string, search?: string): Promise<{ docs: IOrderTenantAggregateDOC[], total: number }>
    getAllOrdersByAdmin(page: number, limit: number, status?: string, search?: string): Promise<{ docs: IOrderAdminAggregateDOC[], total: number }>
    updateStatus(orderId: string, status: OrderStatus): Promise<IOrderDocument | null>
    markAsConfirmed(orderId: string, status: OrderStatus): Promise<IOrderDocument | null>
    addReturnRequest(orderId: string, returnRequest: IReturnRequest, status: OrderStatus): Promise<void>;
    updateReturnReview(orderId: string, reviewFields: { status: ReturnRequestStatus; rejectionReason?: string; reviewedAt: Date; reviewedBy: string; }, orderStatus: OrderStatus): Promise<void>;
}