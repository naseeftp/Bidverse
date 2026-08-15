export const TransactionDirection = {
    DEBIT: "debit",
    CREDIT: "credit",
}

export const TransactionPurpose = {
    SLOT_BOOKING: "slot_booking",
    AUCTION_PAYMENT: "auction_payment",
    PLATFORM_COMMISSION: "platform_commission",
    REFUND: "refund",
    PAYOUT: "payout",
}
export const TransactionStatus = {
    PENDING: "pending",
    COMPLETED: "completed",
    FAILED: "failed",
    REVERSED: "reversed",
}
export const TransactionPartyType = {
    USER: "user",
    AUCTION_HOUSE: "auction_house",
    PLATFORM: "platform",
}

export type transactionPurposeValues = typeof TransactionPurpose[keyof typeof TransactionPurpose]
export type TransactionDirectionValues=typeof TransactionDirection[keyof typeof TransactionDirection]
export type TransactionStatusValues=typeof TransactionStatus[keyof typeof TransactionStatus]

export interface transactionListDTO {
    transactionId: string;
    purpose: transactionPurposeValues;
    direction: TransactionDirectionValues;
    amount: number;
    currency: string;
    status: TransactionStatusValues;
    description?: string;
    auctionId?: string;
    slotBookingId?: string;
    createdAt: Date;
}