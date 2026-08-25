export const NotificationType = {
    SUCCESS: "SUCCESS",
    ERROR: "ERROR",
    WARNING: "WARNING",
    INFO: "INFO"
}

export type NotificationTypeValues = typeof NotificationType[keyof typeof NotificationType]
export const NotificationEvent = {
    SLOT_BOOKED: "SLOT_BOOKED",
    SLOT_CANCELLED: "SLOT_CANCELLED",

    PAYMENT_SUCCESS: "PAYMENT_SUCCESS",
    PAYMENT_FAILED: "PAYMENT_FAILED",
    PAYMENT_REFUNDED: "PAYMENT_REFUNDED",

    AUCTION_APPROVED: "AUCTION_APPROVED",
    AUCTION_REJECTED: "AUCTION_REJECTED",
    AUCTION_CANCELLED: "AUCTION_CANCELLED",
    AUCTION_STARTING_SOON: "AUCTION_STARTING_SOON",
    AUCTION_STARTED: "AUCTION_STARTED",
    AUCTION_ENDED: "AUCTION_ENDED",

    OUTBID: "OUTBID",
    AUCTION_WON: "AUCTION_WON",

    PAYMENT_REQUIRED: "PAYMENT_REQUIRED",

    ESCROW_HELD: "ESCROW_HELD",
    ESCROW_RELEASED: "ESCROW_RELEASED",

    REFUND_PROCESSED: "REFUND_PROCESSED",
    HOUSE_VERIFICATION_REQUESTED: 'AUCTION_HOUSE_VERIFICATION_REQUESTED'
}

export type NotificationEventValues = typeof NotificationEvent[keyof typeof NotificationEvent]

export interface NotificationResponseDTO {
    notificationId: string;
    recipientRole: string,
    type: NotificationTypeValues,
    event: NotificationEventValues,
    title: string,
    message: string,
    isRead: boolean,
    createdAt: Date,
    updatedAt: Date,
}