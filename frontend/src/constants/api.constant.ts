
export const API_BASE_URL = import.meta.env.VITE_API_URL
export const BASE_ROUTES = {
    PROFILE_MANAGEMENT: '/profile',
    ADDRESS: '/address',
    PUBLIC: '/public',
    AUCTION_ITEM: '/auction-item',
    WATCH_LIST: '/watch-list',
    CHAT: '/chat',
    BID: '/bid'


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
    GET_AUCTION_HOUSE: '/admin/auction-house',
    UPDATE_HOUSE_STATUS: '/admin/auction-house-status',
    GET_USERS: '/admin/users',
    GET_USER: '/admin/user',
    UPDATE_USER_STATUS: '/admin/user-update-status'
}

export const PROFILE_ROUTES = {
    GET_PROFILE: '/get-profile',
    CHANGE_DETAILS: '/change-details',
    CHANGE_PASSWORD: '/change-password',
    CHANGE_EMAIL: '/change-email',
    CHANGE_EMAIL_VERIFY: '/change-email-verify',
    CHANGE_EMAIL_RESEND: '/change-email-resend',
    CHANGE_BUSINESS_DETAILS: '/change-business-details',
    HANDLE_PROFILE_IMG: '/handle-profile-image'
}

export const ADDRESS_ROUTES = {
    ADD_ADDRESS: '/create-address',
    GET_USER_ADDRESS: '/addresses',
    DELETE_ADDRESS: '/delete',
    EDIT_ADDRESS: '/edit'
}
export const PUBLIC_ROUTES = {
    AUCTION_HOUSES: '/houses',
    AUCTION_HOUSE: '/house',
    AUCTIONS: '/auctions',
    GET_AUCTION: '/get-auction',
}

export const AUCTION_ITEM_ROUTES = {
    CREATE: '/create',
    ADMIN_AUCTIONS: '/admin/auctions',
    TENANT_AUCTIONS: '/tenant/auctions',
    GET_AUCTION: '/get-auction',
    UPDATE_STATUS: '/update-status',
    UPDATE_AUCTION: '/update-auction'

}
export const WATCH_LIST_ROUTES = {
    ADD_TO_WATCH_LIST: '/add',
    MY_WATH_LIST: '/watch-list',
    REMOVE_ITEM: '/remove'
}

export const CHAT_ROUTES = {
    GET_OR_CREATE_CONVO: '/conversation',
    GET_USER_CONVO: '/user-conversations',
    SEND_MESSAGE: '/send-message',
    GET_MESSAGES: '/get-messages',
    DELETE_EVERYONE: '/delete-for-everyone',
    DELETE_FOR_ME: '/delete-for-me',
    EDIT_MESSAGE: '/edit-message',
    MARK_AS_READED: '/mark-readed',
    UNREAD_COUNT: '/unread-conv-count',
    UPLOAD_AUDIO: '/upload-audio',
    UPLOAD_IMAGE: '/upload-image'
}

export const BID_ROUTES = {
    PLACE_BID: '/place-bid',
    MY_BIDS: '/my-bids',
    BID_HISTORY: '/bid-history'

}