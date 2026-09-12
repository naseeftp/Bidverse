import { IPaymentService } from "../interface/IPayment.service";
import { IPaymentRepository } from "../../repositories/interfaces/IPayment.repository";
import { CreateOrderPaymentIntentDTO, createSlotPaymentDTO, OrderPaymentResponseDTO, slotPaymentResponseDTO, verifyPaymentDTO } from "../../dtos/user.dto/payment.dto";
import Razorpay from "razorpay";
import { Types } from "mongoose";
import { EscrowStatus, PaymentStatus, PaymentType } from "../../constants/payment.constants";
import crypto from "crypto";
import { BadRequestError, NotFoundError } from "../../errors/AppError";
import { ISlotRepository } from "../../repositories/interfaces/ISlot.repository";
import { SlotBookingStatus } from "../../constants/slot.constant";
import { IAuctionItemRepository } from "../../repositories/interfaces/IAuctionItem.repository";
import { ITransactionService } from "../interface/ITransaction.service";
import { TransactionDirection, TransactionPartyType, TransactionPurpose, TransactionStatus } from "../../constants/transaction.constant";
import { MESSAGES, PLATFORM_COMMISSION } from "../../constants/constants";
import { IOrderRepository } from "../../repositories/interfaces/IOrder.repository";
import { IAddressRepository } from "../../repositories/interfaces/IAddress.repository";
import { IPaymentRequestRepository } from "../../repositories/interfaces/IPaymentRequest.repository";
import { PaymentRequestStatus } from "../../types/paymentRequest.types";

export class PaymentService implements IPaymentService {
    constructor(
        private _paymentRepo: IPaymentRepository,
        private _slotRepo: ISlotRepository,
        private _auctionRepo: IAuctionItemRepository,
        private _transactionService: ITransactionService,
        private _razorpay: Razorpay,
        private _orderRepo: IOrderRepository,
        private _addressRepo: IAddressRepository,
        private _paymentRequestRepo:IPaymentRequestRepository,
    ) { }
    async createSlotPayment(data: createSlotPaymentDTO): Promise<slotPaymentResponseDTO> {
        const amountInPaise = Math.round(data.amount * 100);
        const razorPayOrder = await this._razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `slot_${data.slotBookingId}`
        })
        const netAmount = data.amount - (PLATFORM_COMMISSION / 100) * data.amount;
        const platformCommision = (PLATFORM_COMMISSION / 100) * data.amount;
        const payment = await this._paymentRepo.create({
            userId: new Types.ObjectId(data.userId),
            auctionItemId: new Types.ObjectId(data.auctionId),
            type: PaymentType.SLOT_BOOKING,
            slotBookingId: new Types.ObjectId(data.slotBookingId),
            amount: data.amount,
            netAmount: netAmount,
            platformCommision: platformCommision,
            currency: 'INR',
            status: PaymentStatus.PENDING,
            escrowStatus: EscrowStatus.NOT_APPLICABLE,
            razorpayOrderId: razorPayOrder.id
        })
        return {
            paymentId: payment._id.toString(),
            orderId: razorPayOrder.id,
            amount: payment.amount,
            currency: 'INR'
        }
    }

    async createOrderPayment(data: CreateOrderPaymentIntentDTO): Promise<OrderPaymentResponseDTO> {
        const auctionExist=await this._auctionRepo.findById(data.auctionId);
        if(!auctionExist){
            throw new NotFoundError(MESSAGES.AUCTION_CREATED)
        }
        const totalPayingAmount=data.amount+auctionExist.shippingCost;
        const amountInPaise = Math.round(totalPayingAmount * 100);
        const razorPayOrder = await this._razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `order_${data.paymentRequestId}`
        })
        const payment = await this._paymentRepo.create({
            userId: new Types.ObjectId(data.userId),
            auctionItemId: new Types.ObjectId(data.auctionId),
            type: PaymentType.ORDER,
            amount: data.amount,
            currency: 'INR',
            status: PaymentStatus.PENDING,
            escrowStatus: EscrowStatus.NOT_APPLICABLE,
            razorpayOrderId: razorPayOrder.id,
            metadata: {
                paymentRequestId: data.paymentRequestId,
                addressId: data.addressId,
                tenantId: data.tenantId
            }
        })
        return {
            paymentId: payment._id.toString(),
            orderId: razorPayOrder.id,
            amount: payment.amount,
            currency: 'INR',
            keyId:process.env.RAZORPAY_KEY_ID!
        };
    }
    async verifyPayment(data: verifyPaymentDTO): Promise<void> {
        const payment = await this._paymentRepo.findOne({ razorpayOrderId: data.razorpayOrderId })
        if (!payment) {
            throw new NotFoundError("Payment not found");
        }
        if (payment.status === PaymentStatus.PAID) {
            return;
        }
        const generatedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET!
            )
            .update(
                `${data.razorpayOrderId}|${data.razorpayPaymentId}`
            )
            .digest("hex");
        const isValid = crypto.timingSafeEqual(
            Buffer.from(generatedSignature),
            Buffer.from(data.razorpaySignature)
        );

        if (!isValid) {
            throw new BadRequestError(
                "Invalid Razorpay payment signature"
            );
        }
        await this._paymentRepo.updateById(
            payment._id.toString(),
            {
                razorpayPaymentId: data.razorpayPaymentId,
                razorpaySignature: data.razorpaySignature,
                status: PaymentStatus.PAID,
                escrowStatus: EscrowStatus.HELD,
                paidAt: new Date()
            }
        );
        if (payment.type === PaymentType.SLOT_BOOKING && payment.slotBookingId) {
            await this._slotRepo.updateById(
                payment.slotBookingId.toString(),
                {
                    status: SlotBookingStatus.CONFIRMED,
                    paymentId: payment._id,
                }
            )
            const auctionItem = await this._auctionRepo.findById(payment.auctionItemId!.toString())
            if (auctionItem) {
                auctionItem.slotCount += 1
                await auctionItem.save()
            }
            await this._transactionService.createTransaction({
                partyType: TransactionPartyType.USER,
                userId: payment.userId.toString(),
                paymentId: payment._id.toString(),
                auctionItemId: payment.auctionItemId?.toString(),
                slotBookingId: payment.slotBookingId.toString(),
                purpose: TransactionPurpose.SLOT_BOOKING,
                direction: TransactionDirection.DEBIT,
                amount: payment.amount,
                currency: payment.currency,
                status: TransactionStatus.COMPLETED,
                description: 'Auction slot booking payment',
                razorpayOrderId: data.razorpayOrderId,
                razorpayPaymentId: data.razorpayPaymentId
            })

        }
        if (payment.type === PaymentType.ORDER) {
            const existingOrder = await this._orderRepo.findByPaymentRequestId(payment.metadata?.paymentRequestId ?? '');
            if (!existingOrder) {
                const address = await this._addressRepo.findById(payment.metadata?.addressId ?? '');
                if (!address) throw new NotFoundError(MESSAGES.ADDRES_NOT_FOUND)
                const auctionItem = await this._auctionRepo.findById(payment.auctionItemId!.toString());
                if (!auctionItem) throw new NotFoundError(MESSAGES.AUCTION_NOT_FOUND);
                const shippingSnapshot = {
                    recipientName: address.recipientName,
                    phone: address.phone,
                    altPhone: address.altPhone,
                    fullAddress: address.fullAddress,
                    pincode: address.pincode,
                    landMark: address.landMark,
                    city: address.city,
                    state: address.state,
                    country: address.country
                };

                const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
                const totalAmount = payment.amount + auctionItem.shippingCost;
                const newOrder = await this._orderRepo.createOrder({
                    orderNumber,
                    auctionItemId: payment.auctionItemId!.toString(),
                    paymentRequestId: payment.metadata?.paymentRequestId ?? '',
                    paymentId: payment._id.toString() ?? "",
                    tenantId: payment.metadata?.tenantId ?? '',
                    buyerId: payment.userId.toString(),
                    addressId: payment.metadata?.addressId ?? '',
                    shippingSnapshot,
                    itemAmount: payment.amount,
                    shippingCost: auctionItem.shippingCost,
                    totalAmount,
                    currency: payment.currency
                });
                await this._paymentRequestRepo.updateStatus(payment.metadata?.paymentRequestId??'',PaymentRequestStatus.COMPLETED)
                await this._transactionService.createTransaction({
                    partyType: TransactionPartyType.USER,
                    userId: payment.userId.toString(),
                    paymentId: payment._id.toString(),
                    auctionItemId: payment.auctionItemId?.toString(),
                    purpose: TransactionPurpose.ORDER_PAYMENT, 
                    direction: TransactionDirection.DEBIT,
                    amount: totalAmount,
                    currency: payment.currency,
                    status: TransactionStatus.COMPLETED,
                    description: `Order payment for ${newOrder.orderNumber}`,
                    razorpayOrderId: data.razorpayOrderId,
                    razorpayPaymentId: data.razorpayPaymentId
                });

            }
        }

    }
    async refundSlotPayment(slotId: string): Promise<void> {
        const payment = await this._paymentRepo.findOne({
            slotBookingId: new Types.ObjectId(slotId)
        });
        if (!payment) {
            throw new NotFoundError(MESSAGES.PAYMENT_NOT_FOUND)
        }
        if (payment.status !== PaymentStatus.PAID) {
            return
        };
        if (payment.escrowStatus !== EscrowStatus.HELD) {
            return
        }
        if (!payment.razorpayPaymentId) {
            throw new BadRequestError('Razorpay payment ID is missing')
        };

        await this._razorpay.payments.refund(
            payment.razorpayPaymentId,
            {
                amount: Math.round(payment.amount * 100)
            }
        )

        await this._paymentRepo.updateById(
            payment._id.toString(),
            {
                status: PaymentStatus.REFUNDED,
                escrowStatus: EscrowStatus.REFUNDED,
                refundedAt: new Date()
            }
        )

        await this._transactionService.createTransaction({
            partyType: TransactionPartyType.USER,
            userId: payment.userId.toString(),
            paymentId: payment._id.toString(),
            auctionItemId: payment.auctionItemId?.toString(),
            slotBookingId: payment.slotBookingId?.toString(),
            purpose: TransactionPurpose.REFUND,
            direction: TransactionDirection.CREDIT,
            amount: payment.amount,
            currency: payment.currency,
            status: TransactionStatus.COMPLETED,
            description: 'Slot booking refund',
            razorpayPaymentId: payment.razorpayPaymentId,
            razorpayOrderId: payment.razorpayOrderId,
        })
    }
    async refundForCancelAuction(auctionId: string): Promise<void> {
        const payments = await this._paymentRepo.findHeldPaymentByAuction(auctionId);
        for (const payment of payments) {
            if (!payment.razorpayPaymentId) {
                continue;
            }
            await this._razorpay.payments.refund(
                payment.razorpayPaymentId,
                {
                    amount: Math.round(
                        payment.amount * 100
                    )
                }
            )
            await this._paymentRepo.updateById(
                payment._id.toString(),
                {
                    status: PaymentStatus.REFUNDED,
                    escrowStatus: EscrowStatus.REFUNDED,
                    refundedAt: new Date(),

                }
            )
            if (payment.slotBookingId) {
                await this._slotRepo.updateById(
                    payment.slotBookingId.toString(),
                    {
                        status: SlotBookingStatus.CANCELLED
                    }
                )
            }
            await this._transactionService.createTransaction({
                partyType: TransactionPartyType.USER,
                userId: payment.userId.toString(),
                paymentId: payment._id.toString(),
                auctionItemId: payment.auctionItemId?.toString(),
                slotBookingId: payment.slotBookingId?.toString(),
                purpose: TransactionPurpose.REFUND,
                direction: TransactionDirection.CREDIT,
                amount: payment.amount,
                currency: payment.currency,
                status: TransactionStatus.COMPLETED,
                description: "Slot booking refund due to auction cancellation",
                razorpayPaymentId: payment.razorpayPaymentId,
                razorpayOrderId: payment.razorpayOrderId
            })

        }
    }
}