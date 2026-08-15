import { IPaymentService } from "../interface/IPayment.service";
import { IPaymentRepository } from "../../repositories/interfaces/IPayment.repository";
import { createSlotPaymentDTO, slotPaymentResponseDTO, verifyPaymentDTO } from "../../dtos/user.dto/payment.dto";
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
import { PLATFORM_COMMISSION } from "../../constants/constants";

export class PaymentService implements IPaymentService {
    constructor(
        private _paymentRepo: IPaymentRepository,
        private _slotRepo: ISlotRepository,
        private _auctionRepo: IAuctionItemRepository,
        private _transactionService: ITransactionService,
        private _razorpay: Razorpay
    ) { }
    async createSlotPayment(data: createSlotPaymentDTO): Promise<slotPaymentResponseDTO> {
        const amountInPaise = Math.round(data.amount * 100);
        const razorPayOrder = await this._razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `slot_${data.slotBookingId}`
        })
        const netAmount=data.amount-(PLATFORM_COMMISSION/100)*data.amount;
        const platformCommision=(PLATFORM_COMMISSION/100)*data.amount;
        const payment = await this._paymentRepo.create({
            userId: new Types.ObjectId(data.userId),
            auctionItemId: new Types.ObjectId(data.auctionId),
            type: PaymentType.SLOT_BOOKING,
            slotBookingId: new Types.ObjectId(data.slotBookingId),
            amount: data.amount,
            netAmount:netAmount,
            platformCommision:platformCommision,
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

    async verifyPayment(data: verifyPaymentDTO): Promise<void> {
        //find payment by razorpay orderId
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

    }
}