
export const BASE_ROUTES={
    AUTH:'/auth'
} as const

export const AUTH_ROUTES={
    REGISTER:'/register',
    VERIFY_OTP:'/verify-otp',
    RESEND_OTP:'/resend-otp',
    LOGIN:'/login',
    GOOGLE:'/google',
    GOOGLE_CALLBACK:'/google/callback',
    FORGOT_PASS:'/forgot-pass',
    FORGOT_PASS_RESEND_OTP:'forgot-pass-resend'
}as const