export enum TransactionDirection {
    DEBIT = "debit",
    CREDIT = "credit",
}

export enum TransactionPurpose {
    SLOT_BOOKING = "slot_booking",
    AUCTION_PAYMENT = "auction_payment",
    PLATFORM_COMMISSION = "platform_commission",
    REFUND = "refund",
    PAYOUT = "payout",
}
export enum TransactionStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    REVERSED = "reversed",
}
export enum TransactionPartyType {
    USER = "user",
    AUCTION_HOUSE = "auction_house",
    PLATFORM = "platform",
}