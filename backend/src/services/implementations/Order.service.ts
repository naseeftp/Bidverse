import { IOrderService } from "../interface/IOrder.service";
import { IPaymentRequestRepository } from "../../repositories/interfaces/IPaymentRequest.repository";
import { CreateOrderDTO, } from "../../dtos/user.dto/order.dto";
import { NotFoundError } from "../../errors/AppError";
import { MESSAGES } from "../../constants/constants";
import { IAddressRepository } from "../../repositories/interfaces/IAddress.repository";
import { IPaymentService } from "../interface/IPayment.service";
import { OrderPaymentResponseDTO } from "../../dtos/user.dto/payment.dto";

export class OrderService implements IOrderService {
    constructor(
        private _paymentRepo: IPaymentRequestRepository,
        private _addressRepo: IAddressRepository,
        private _paymentService: IPaymentService
    ) { }
    async initiateOrderPayment(buyerId: string,data: CreateOrderDTO): Promise<OrderPaymentResponseDTO> {
        const paymentRequest = await this._paymentRepo.findByRequestId(data.paymentRequestId);
        if (!paymentRequest) throw new NotFoundError(MESSAGES.PAYMENT_REQUEST_NOT_FOUND);
        const tenantId=paymentRequest.tenantId.toString()
        const address = await this._addressRepo.findById(data.addressId);
        if (!address) throw new NotFoundError(MESSAGES.ADDRES_NOT_FOUND);
        return this._paymentService.createOrderPayment({
            userId: buyerId,
            tenantId,
            auctionId: paymentRequest.auctionId.toString(),
            paymentRequestId: paymentRequest._id.toString(),
            addressId: data.addressId,
            amount: paymentRequest.amount,
            
        })
    }
}