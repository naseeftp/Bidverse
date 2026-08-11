import type {RazorpayOptions,RazorpayPaymentResponse} from '../types/razorpay.dto'

export const openRazorpayCheckout = (
    paymentData: {
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
    },
    onSuccess: (response: RazorpayPaymentResponse) => void,
    onDismiss?: () => void
) => {

    const options: RazorpayOptions = {
        key: paymentData.keyId,

        amount: paymentData.amount * 100,

        currency: paymentData.currency,

        name: "BidVerse",

        description: "Auction Slot Booking",

        order_id: paymentData.orderId,

        handler: (response) => {
            onSuccess(response);
        },

        theme: {
            color: "#C9653B"
        },

        modal: {
            ondismiss: () => {
                onDismiss?.();
            }
        }
    };

    const razorpay = new window.Razorpay(options);

    razorpay.open();
};