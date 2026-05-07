
export const BASE_ROUTES = {
    AUTH: '/auth',
    AUCTION_HOUSE: '/auction-house',
    ADMIN: '/admin',
    PROFILE_MANAGEMENT: '/profile',
    ADDRESS:'/address'
} as const

export const AUTH_ROUTES = {
    REGISTER: '/register',
    VERIFY_OTP: '/verify-otp',
    RESEND_OTP: '/resend-otp',
    LOGIN: '/login',
    LOGOUT: '/logout',
    GOOGLE: '/google',
    GOOGLE_CALLBACK: '/google/callback',
    FORGOT_PASS: '/forgot-pass',
    FORGOT_PASS_RESEND_OTP: 'forgot-pass-resend',
    FORGOT_PASS_RESET: '/forgot-pass-reset',
    REFRESH_TOKEN: "/refresh-token"
} as const

export const AUCTION_HOUSE_ROUTES = {
    VERIFY: '/verify',
    PROFILE: '/profile',
    UPLOAD_SIGNATURE: '/upload-signature'
}

export const ADMIN_ROUTES = {
    GET_AUCTION_HOUSES: '/auction-houses',
    GET_AUCTION_HOUSE: '/auction-house/:id',
    AUCTION_HOUSE_UPDATE_STATUS: '/auction-house-status/:id',
    GET_USERS: '/users',
    GET_USER: '/user/:id',
    USER_UPDATE_STATUS: '/user-update-status/:id'
}

export const PROFILE_ROUTES = {
    GET_PROFILE: '/get-profile',
    CHANGE_DETAILS: '/change-details',
    CHANGE_PASSWORD: '/change-password',
    CHANGE_EMAIL: '/change-email',
    CHANGE_EMAIL_VERIFY: '/change-email-verify',
    CHANGE_EMAIL_RESEND: '/change-email-resend',
    CHANGE_BUSINESS_DETAILS:'/change-business-details'
}
export const ADDRESS_ROUTES={
    CREATE_ADDRESS:'/create-address'
}