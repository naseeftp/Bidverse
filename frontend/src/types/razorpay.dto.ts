export interface RazorpayPaymentResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

export interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    order_id: string;

    handler: (response: RazorpayPaymentResponse) => void;

    theme?: {
        color?: string;
    };

    modal?: {
        ondismiss?: () => void;
    };
}

export interface RazorpayInstance {
    open(): void;
    close(): void;
}

export interface RazorpayConstructor {
    new(options: RazorpayOptions): RazorpayInstance;
}

declare global {
    interface Window {
        Razorpay: RazorpayConstructor;
    }
}