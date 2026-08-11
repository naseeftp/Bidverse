import { IPaymentService } from "../interface/IPayment.service";
import { IPaymentRepository } from "../../repositories/interfaces/IPayment.repository";
import { createSlotPaymentDTO, slotPaymentResponseDTO, verifyPaymentDTO } from "../../dtos/user.dto/payment.dto";
import Razorpay from "razorpay";
import { Types } from "mongoose";
import { PaymentStatus, PaymentType } from "../../constants/payment.constants";
import crypto from "crypto";
import { BadRequestError, NotFoundError } from "../../errors/AppError";

export class PaymentService implements IPaymentService {
    constructor(
        private _paymentRepo: IPaymentRepository,
        private _razorpay: Razorpay
    ) { }
    async createSlotPayment(data: createSlotPaymentDTO): Promise<slotPaymentResponseDTO> {
        const amountInPaise = Math.round(data.amount * 100);
        const razorPayOrder = await this._razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `slot_${data.slotBookingId}`
        })
        const payment = await this._paymentRepo.create({
            userId: new Types.ObjectId(data.userId),
            auctionItemId: new Types.ObjectId(data.auctionId),
            type: PaymentType.SLOT_BOOKING,
            amount: data.amount,
            currency: 'INR',
            status: PaymentStatus.PENDING,
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
        const payment = await this._paymentRepo.findOne({razorpayOrderId:data.razorpayOrderId})
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
                paidAt: new Date()
            }
        );

    }
}