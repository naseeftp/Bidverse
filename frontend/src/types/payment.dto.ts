export interface verifyPaymentDTO {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}

export interface OrderPaymentResponseDTO {
    paymentId: string;
    orderId: string;
    amount: number;
    currency: string;
    keyId:string
}