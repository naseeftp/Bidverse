import { OrderStatus } from "../../constants/order.constant";
import { CreateOrderDTO, OrderListResponseDTO,OrderDetailsResponseDTO,OrderTenantListResponseDTO, OrderAdminListResponseDTO,CreateReturnRequestDTO,ReviewReturnRequestDTO} from "../../dtos/user.dto/order.dto";
import { OrderPaymentResponseDTO } from "../../dtos/user.dto/payment.dto";
import { IGenericPaginatedResposnse } from "../../types/response.type";

export interface IOrderService{
    initiateOrderPayment(buyerId: string,  data: CreateOrderDTO): Promise<OrderPaymentResponseDTO>;
    getUserOrders(userId:string,page:number,limit:number,status?:string,search?:string):Promise<IGenericPaginatedResposnse<OrderListResponseDTO>>
    getTenantOrders(tenantId:string,page:number,limit:number,status?:string,search?:string):Promise<IGenericPaginatedResposnse<OrderTenantListResponseDTO>>
    getAllOrdersByAdmin(page:number,limit:number,status?:string,search?:string):Promise<IGenericPaginatedResposnse<OrderAdminListResponseDTO>>
    getOrderDetails(orderId: string): Promise<OrderDetailsResponseDTO>
    updateStatus(orderId:string,status:OrderStatus):Promise<void>
    markAsConfirmed(orderId:string):Promise<void>
    requestReturn(orderId: string, buyerId: string, data: CreateReturnRequestDTO): Promise<void>
    reviewReturnRequest(orderId: string, adminId: string, data: ReviewReturnRequestDTO): Promise<void>;
}