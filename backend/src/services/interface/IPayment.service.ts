import { CreateOrderPaymentIntentDTO, createSlotPaymentDTO, OrderPaymentResponseDTO, slotPaymentResponseDTO, verifyPaymentDTO } from "../../dtos/user.dto/payment.dto"


export interface IPaymentService {
    createSlotPayment(data: createSlotPaymentDTO): Promise<slotPaymentResponseDTO>
    verifyPayment(data: verifyPaymentDTO): Promise<void>
    refundSlotPayment(slotId: string): Promise<void>;
    refundForCancelAuction(auctionId: string): Promise<void>
    createOrderPayment(data: CreateOrderPaymentIntentDTO): Promise<OrderPaymentResponseDTO>
    releaseEscrowForOrder(orderId: string, paymentId: string, tenantId: string, shippingCost: number,houseId:string,adminId:string): Promise<void>;
    releaseEscrowForSlots(auctionItemId: string): Promise<void> 
}