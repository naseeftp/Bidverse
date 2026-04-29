

export const API_BASE_URL = import.meta.env.VITE_API_URL
export const BASE_ROUTES = {
    PROFILE_MANAGEMENT: '/profile'
}
export const AUTH_ROUTES = {
    REGISTER: "/auth/register",
    VERIFY_OTP: "/auth/verify-otp",
    RESEND_OTP: '/auth/resend-otp',
    REFRESH: "/auth/refresh-token",
    LOGIN: '/auth/login',
    FORGOT_PASS: '/auth/forgot-pass',
    RESET_PASSWORD: '/auth/forgot-pass-reset',
    LOGOUT: '/auth/logout'
} as const

export const AUCTION_HOUSE_ROUTES = {
    VERIFY_HOUSE: '/auction-house/verify',
    GET_PROFILE: '/auction-house/profile',
    GET_UPLOAD_SIGNATURE: '/auction-house/upload-signature'
}

export const ADMIN_ROUTES = {
    GET_AUCTION_HOUSES: "/admin/auction-houses",
    UPDATE_HOUSE_STATUS: '/admin/auction-house-status',
    GET_USERS: '/admin/users',
    GET_USER: '/admin/user',
    UPDATE_USER_STATUS: '/admin/user-update-status'
}

export const PROFILE_ROUTES = {
    GET_PROFILE: '/get-profile',
    CHANGE_DETAILS: '/change-details',
    CHANGE_PASSWORD: '/change-password',
}