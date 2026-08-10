export enum PaymentType {
    SLOT_BOOKING = "slot_booking",
    AUCTION_PAYMENT = "auction_payment"
}

export const PaymentTypeValues = Object.values(PaymentType);

export enum PaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    HELD = "held",
    RELEASED = "released",
    REFUND_PENDING = "refund_pending",
    REFUNDED = "refunded",
    FAILED = "failed",
    CANCELLED = "cancelled"
}

export const PaymentStatusValues = Object.values(PaymentStatus);