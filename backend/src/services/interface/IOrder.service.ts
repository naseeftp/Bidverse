import { CreateOrderDTO} from "../../dtos/user.dto/order.dto";
import { OrderPaymentResponseDTO } from "../../dtos/user.dto/payment.dto";

export interface IOrderService{
    initiateOrderPayment(buyerId: string,  data: CreateOrderDTO): Promise<OrderPaymentResponseDTO>;
}