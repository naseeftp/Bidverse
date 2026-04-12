
export const BASE_ROUTES = {
    AUTH: '/auth',
    AUCTION_HOUSE: '/auction-house',
    ADMIN:'/admin'
} as const

export const AUTH_ROUTES = {
    REGISTER: '/register',
    VERIFY_OTP: '/verify-otp',
    RESEND_OTP: '/resend-otp',
    LOGIN: '/login',
    GOOGLE: '/google',
    GOOGLE_CALLBACK: '/google/callback',
    FORGOT_PASS: '/forgot-pass',
    FORGOT_PASS_RESEND_OTP: 'forgot-pass-resend',
    FORGOT_PASS_RESET: '/forgot-pass-reset'
} as const

export const AUCTION_HOUSE_ROUTES = {
    VERIFY: '/verify',
    PROFILE: '/profile',
    UPLOAD_SIGNATURE: '/upload-signature'
}

export const ADMIN_ROUTES={
    GET_AUCTION_HOUSES:'/auction-houses'
}