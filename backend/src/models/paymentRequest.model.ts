import { IPaymentRequestDocument } from "../types/paymentRequest.types";
import { PaymentRequestStatus } from "../types/paymentRequest.types";
import mongoose,{Schema} from "mongoose";

const paymentRequestSchema=new Schema<IPaymentRequestDocument>({
tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    auctionId: {
      type: Schema.Types.ObjectId,
      ref: "AuctionItem",
      required: true,
      unique: true, 
      index: true,
    },
    bidderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
   
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(PaymentRequestStatus),
      default: PaymentRequestStatus.PENDING,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },{timestamps:true}
)
paymentRequestSchema.index({ tenantId: 1, bidderId: 1, status: 1 });
export const PaymentRequest=mongoose.model<IPaymentRequestDocument>('PaymentRequest',paymentRequestSchema)