import { CreateOrderDTO, OrderListResponseDTO,OrderDetailsResponseDTO,OrderTenantListResponseDTO} from "../../dtos/user.dto/order.dto";
import { OrderPaymentResponseDTO } from "../../dtos/user.dto/payment.dto";
import { IGenericPaginatedResposnse } from "../../types/response.type";

export interface IOrderService{
    initiateOrderPayment(buyerId: string,  data: CreateOrderDTO): Promise<OrderPaymentResponseDTO>;
    getUserOrders(userId:string,page:number,limit:number,status?:string,search?:string):Promise<IGenericPaginatedResposnse<OrderListResponseDTO>>
    getTenantOrders(tenantId:string,page:number,limit:number,status?:string,search?:string):Promise<IGenericPaginatedResposnse<OrderTenantListResponseDTO>>
    getOrderDetails(orderId: string, buyerId: string): Promise<OrderDetailsResponseDTO>
}