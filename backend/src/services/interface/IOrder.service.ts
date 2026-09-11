import { CreateOrderDTO, OrderListResponseDTO} from "../../dtos/user.dto/order.dto";
import { OrderPaymentResponseDTO } from "../../dtos/user.dto/payment.dto";
import { IGenericPaginatedResposnse } from "../../types/response.type";

export interface IOrderService{
    initiateOrderPayment(buyerId: string,  data: CreateOrderDTO): Promise<OrderPaymentResponseDTO>;
    getUserOrders(userId:string,page:number,limit:number,status?:string):Promise<IGenericPaginatedResposnse<OrderListResponseDTO>>
}