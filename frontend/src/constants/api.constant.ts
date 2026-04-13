

export const API_BASE_URL=import.meta.env.VITE_API_URL
export const AUTH_ROUTES={
    REGISTER:"/auth/register",
    VERIFY_OTP:"/auth/verify-otp",
    RESEND_OTP:'/auth/resend-otp',
    REFRESH:"/auth/refresh-token",
    LOGIN:'/auth/login',
    FORGOT_PASS:'/auth/forgot-pass',
    RESET_PASSWORD:'/auth/forgot-pass-reset' 
}as const

export const AUCTION_HOUSE_ROUTES={
    VERIFY_HOUSE:'/auction-house/verify',
    GET_PROFILE:'/auction-house/profile',
    GET_UPLOAD_SIGNATURE:'/auction-house/upload-signature'
}

export const ADMIN_ROUTES={
    GET_AUCTION_HOUSES: "/admin/auction-houses",
    UPDATE_HOUSE_STATUS:'/admin/auction-house-status'
}