
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

export interface CreateOrderPaymentIntentDTO {
    userId: string;
    tenantId: string;
    auctionId: string;
    paymentRequestId: string;
    addressId: string;
    amount: number;
}
export interface OrderPaymentResponseDTO {
    paymentId: string;
    orderId: string;
    amount: number;
    currency: string;
    keyId: string
}
export interface VerifyOrderPaymentDTO {
    userId: string;
    tenantId: string;
    paymentRequestId: string;
    addressId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}
