import { createSlotPaymentDTO,slotPaymentResponseDTO, verifyPaymentDTO } from "../../dtos/user.dto/payment.dto"


export interface IPaymentService{
    createSlotPayment(data:createSlotPaymentDTO):Promise<slotPaymentResponseDTO>
    verifyPayment(data:verifyPaymentDTO):Promise<void>
    refundSlotPayment(slotId:string):Promise<void>
}