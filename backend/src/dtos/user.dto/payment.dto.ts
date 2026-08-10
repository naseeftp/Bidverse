
export interface createSlotPaymentDTO {
    userId: string,
    auctionId: string,
    slotBookingId: string,
    amount: number
}

export interface slotPaymentResponseDTO {
    paymentId: string;
    orderId: string;
    amount: number;
    currency: string
}

export interface verifyPaymentDTO {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}

export interface CreatePaymentResponseDTO {
    paymentId: string;
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
}

