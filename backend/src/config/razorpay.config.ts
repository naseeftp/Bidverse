import Razorpay from "razorpay";

const razorPayKeyId=process.env.RAZORPAY_KEY_ID;
const razorPayKeySecret=process.env.RAZORPAY_KEY_SECRET

export const razorpay=new Razorpay({
    key_id:razorPayKeyId,
    key_secret:razorPayKeySecret
})