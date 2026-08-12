
export enum PaymentType {
    SLOT_BOOKING = "slot_booking",
    AUCTION_PAYMENT = "auction_payment"
}

export const PaymentTypeValues = Object.values(PaymentType);

export enum PaymentStatus {
   PENDING = "pending",
    PAID = "paid",
    FAILED = "failed",
    REFUNDED = "refunded"
}
export const PaymentStatusValues = Object.values(PaymentStatus);

export enum EscrowStatus {
    NOT_APPLICABLE = "not_applicable",
    HELD = "held",
    RELEASED = "released",
    REFUND_PENDING = "refund_pending",
    REFUNDED = "refunded"
}
export const EscrowStatusValues=Object.values(EscrowStatus)