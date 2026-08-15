import {
    TransactionDirection,
    TransactionPartyType,
    TransactionPurpose,
    TransactionStatus
} from "../../constants/transaction.constant";

export interface CreateTransactionDTO {
    partyType: TransactionPartyType;
    userId?: string;
    auctionHouseId?: string;
    paymentId?: string;
    auctionItemId?: string;
    slotBookingId?: string;
    purpose: TransactionPurpose;
    direction: TransactionDirection;
    amount: number;
    currency: string;
    status?: TransactionStatus;
    description?: string;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
}

export interface TransactionResponseDTO {
    transactionId: string;
    partyType: TransactionPartyType;
    userId?: string;
    auctionHouseId?: string;
    paymentId?: string;
    auctionItemId?: string;
    slotBookingId?: string;
    purpose: TransactionPurpose;
    direction: TransactionDirection;
    amount: number;
    currency: string;
    status: TransactionStatus;
    description?: string;
    createdAt: Date;
}

export interface transactionListDTO {
    transactionId: string;
    purpose: TransactionPurpose;
    direction: TransactionDirection;
    amount: number;
    currency: string;
    status: TransactionStatus;
    description?: string;
    auctionId?: string;
    slotBookingId?: string;
    createdAt: Date;
}