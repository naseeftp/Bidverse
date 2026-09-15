import { IOrderService } from "../interface/IOrder.service";
import { IPaymentRequestRepository } from "../../repositories/interfaces/IPaymentRequest.repository";
import { CreateOrderDTO, OrderListResponseDTO, OrderDetailsResponseDTO, OrderTenantListResponseDTO, OrderAdminListResponseDTO,CreateReturnRequestDTO } from "../../dtos/user.dto/order.dto";
import { NotFoundError,ForbiddenError,BadRequestError } from "../../errors/AppError";
import { MESSAGES } from "../../constants/constants";
import { IAddressRepository } from "../../repositories/interfaces/IAddress.repository";
import { IPaymentService } from "../interface/IPayment.service";
import { OrderPaymentResponseDTO } from "../../dtos/user.dto/payment.dto";
import { IOrderRepository } from "../../repositories/interfaces/IOrder.repository";
import { OrderMapper } from "../../mappers/order.mapper";
import { IGenericPaginatedResposnse } from "../../types/response.type";
import { IAuctionHouseRepository } from "../../repositories/interfaces/IAuctionHouse.repository";
import { OrderStatus,ReturnRequestStatus } from "../../constants/order.constant";
import { IUserRepository } from "../../repositories/interfaces/iUser.repository";

export class OrderService implements IOrderService {
    constructor(
        private _paymentRepo: IPaymentRequestRepository,
        private _addressRepo: IAddressRepository,
        private _paymentService: IPaymentService,
        private _orderRepo: IOrderRepository,
        private _houseRepo:IAuctionHouseRepository,
        private _userRepo:IUserRepository
    ) { }
    async initiateOrderPayment(buyerId: string, data: CreateOrderDTO): Promise<OrderPaymentResponseDTO> {
        const paymentRequest = await this._paymentRepo.findByRequestId(data.paymentRequestId);
        if (!paymentRequest) throw new NotFoundError(MESSAGES.PAYMENT_REQUEST_NOT_FOUND);
        const tenantId = paymentRequest.tenantId.toString()
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

    async getUserOrders(userId: string, page: number, limit: number, status?: string, search?: string): Promise<IGenericPaginatedResposnse<OrderListResponseDTO>> {
        const { docs, total } = await this._orderRepo.getUserOrders(userId, page, limit, status, search);
        const mappedDocs = docs.map((doc) =>
            OrderMapper.toListDTO(doc)
        )

        return {
            data: mappedDocs,
            pagination: {
                totalItems: total,
                itemsPerPage: limit,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit > total,
                hasPrevPage: page > 1
            }
        }
    }
    async getTenantOrders(tenantId: string, page: number, limit: number, status?: string, search?: string): Promise<IGenericPaginatedResposnse<OrderTenantListResponseDTO>> {
        const houseExist=await this._houseRepo.findOne({userId:tenantId});
        if(!houseExist){
            throw new NotFoundError(MESSAGES.AUCTION_HOUSE_NOT_FOUND)
        }
        const houseId=houseExist._id.toString();
        const { docs, total } = await this._orderRepo.getTenantOrders(houseId, page, limit, status, search);
        const mappedDocs = docs.map((doc) =>
            OrderMapper.toTenantOrdersListDTO(doc)
        )
        return {
            data: mappedDocs,
            pagination: {
                totalItems: total,
                itemsPerPage: limit,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit > total,
                hasPrevPage: page > 1
            }
        }
    }
    async getAllOrdersByAdmin(page: number, limit: number, status?: string, search?: string): Promise<IGenericPaginatedResposnse<OrderAdminListResponseDTO>> {
        const {docs,total}=await this._orderRepo.getAllOrdersByAdmin(page,limit,status,search)
        const mappedDocs=docs.map((doc)=>OrderMapper.toAdminOrdersListDTO(doc))
        return{
            data:mappedDocs,
            pagination:{
                totalItems:total,
                itemsPerPage:limit,
                currentPage:page,
                totalPages:Math.ceil(total/limit),
                hasNextPage:page*limit>total,
                hasPrevPage:page>1
            }
        }
    }

    async getOrderDetails(orderId: string): Promise<OrderDetailsResponseDTO> {
        const order = await this._orderRepo.findOrderDetailsById(orderId);
        if (!order) {
            throw new NotFoundError(MESSAGES.ORDER_NOT_FOUND)
        }
        return OrderMapper.toDetailsDTO(order)
    }
    async updateStatus(orderId: string, status: OrderStatus): Promise<void> {
        const order=await this._orderRepo.findById(orderId);
        if(!order){
            throw new NotFoundError(MESSAGES.ORDER_NOT_FOUND)
        }
        await this._orderRepo.updateStatus(orderId,status)
    }
    async markAsConfirmed(orderId: string): Promise<void> {
        const order=await this._orderRepo.findById(orderId);
        if(!order){
            throw new NotFoundError(MESSAGES.ORDER_NOT_FOUND);
        }
        if(order.status!==OrderStatus.DELIVERED){
            throw new BadRequestError('Only delivered Order Can be Confirmed');
        }
        const house=await this._houseRepo.findById(order.tenantId.toString());
        const houseUserId=house?.userId.toString();
        const admin=await this._userRepo.findOne({role:'admin'});
        const adminId=admin?._id.toString();
        await this._paymentService.releaseEscrowForOrder(
            orderId,
            order.paymentId?.toString()??'',
            order.tenantId.toString(),
            order.shippingCost,
            houseUserId??'',
            adminId??""
        )
        await this._orderRepo.markAsConfirmed(orderId,OrderStatus.COMPLETED)
    }
    async requestReturn(orderId: string, buyerId: string, data: CreateReturnRequestDTO): Promise<void> {
    const order = await this._orderRepo.findById(orderId);
    if (!order) throw new NotFoundError(MESSAGES.ORDER_NOT_FOUND);

    if (order.buyerId.toString() !== buyerId) {
        throw new ForbiddenError(MESSAGES.NOT_PERMITTED); 
    }

    if (order.status !== OrderStatus.DELIVERED) {
        throw new BadRequestError("Return can only be requested for delivered orders");
    }

    if (!data.proofs || data.proofs.length === 0) {
        throw new BadRequestError("At least one proof image is required");
    }

    const returnRequest = {
        reason: data.reason,
        description: data.description,
        proofs: data.proofs,
        status: ReturnRequestStatus.PENDING,
        requestedAt: new Date()
    };

    await this._orderRepo.addReturnRequest(orderId, returnRequest, OrderStatus.RETURN_REQUESTED);
}
}