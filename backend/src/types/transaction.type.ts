import { Types ,Document} from "mongoose";
import { TransactionDirection, TransactionPartyType, TransactionPurpose, TransactionStatus } from "../constants/transaction.constant";

export interface ITransaction {
    partyType: TransactionPartyType;
    userId?: Types.ObjectId;
    auctionHouseId: Types.ObjectId;
    paymentId?: Types.ObjectId;
    auctionItemId?: Types.ObjectId;
    slotBookingId?: Types.ObjectId;
    purpose: TransactionPurpose;
    direction: TransactionDirection;
    amount: number;
    currency: string;
    status: TransactionStatus;
    description?: string;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    createdAt: Date;
    updatedAt: Date;

}

export type ITransactionDocument=ITransaction&Document;