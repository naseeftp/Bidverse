

export const API_BASE_URL=import.meta.env.VITE_API_URL

export const AUTH_ROUTES={
    REGISTER:"/auth/register",
    VERIFY_OTP:"/auth/verify-otp",
    RESEND_OTP:'/auth/resend-otp',
    REFRESH:"/auth/refresh-token",
    LOGIN:'/auth/login',
    FORGOT_PASS:'/auth/forgot-pass',
   
}as const