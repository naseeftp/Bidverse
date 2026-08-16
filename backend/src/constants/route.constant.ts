

export const BASE_ROUTES = {
    AUTH: '/auth',
    AUCTION_HOUSE: '/auction-house',
    ADMIN: '/admin',
    PROFILE_MANAGEMENT: '/profile',
    ADDRESS: '/address',
    PUBLIC: '/public',
    AUCTION_ITEM: '/auction-item',
    WATCH_LIST: '/watch-list',
    CHAT: '/chat',
    BID: '/bid',
    SLOT: '/slot',
    PAYMENT: '/payment',
    TRANSACTION: '/transaction',
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
    CHANGE_BUSINESS_DETAILS: '/change-business-details',
    HANDLE_PROFILE_IMG: '/handle-profile-image'
}
export const ADDRESS_ROUTES = {
    CREATE_ADDRESS: '/create-address',
    GET_USER_ADDRESS: '/addresses',
    DELETE_ADDRESS: '/delete/:id',
    EDIT_ADDRESS: '/edit/:id'
}

export const PUBLIC_ROUTES = {
    AUCTION_HOUSES: '/houses',
    AUCTION_HOUSE: '/house/:id',
    AUCTIONS: '/auctions',
    GET_AUCTION: '/get-auction/:id',
}

export const AUCTION_ITEM_ROUTES = {
    CREATE: '/create',
    ADMIN_AUCTIONS: '/admin/auctions',
    TENANT_AUCTIONS: '/tenant/auctions',
    GET_AUCTION: '/get-auction/:id',
    UPDATE_STATUS: '/update-status',
    UPDATE_AUCTION: '/update-auction/:id',
    CANCEL_AUCTION:'/cancel-auction'
}

export const WATCH_LIST_ROUTES = {
    ADD_TO_WATCH_LIST: '/add',
    MY_WATH_LIST: '/watch-list',
    REMOVE_ITEM: '/remove/:id'
}
export const CHAT_ROUTES = {
    GET_OR_CREATE_CONVO: '/conversation',
    GET_USER_CONVO: '/user-conversations',
    SEND_MESSAGE: '/send-message',
    GET_MESSAGES: '/get-messages/:id',
    DELETE_EVERYONE: '/delete-for-everyone/:id',
    DELETE_FOR_ME: '/delete-for-me/:id',
    EDIT_MESSAGE: '/edit-message/:id',
    MARK_AS_READED: '/mark-readed/:id',
    UNREAD_COUNT: '/unread-conv-count',
    UPLOAD_AUDIO: '/upload-audio',
    UPLOAD_IMAGE: '/upload-image'
}
export const BID_ROUTES = {
    PLACE_BID: '/place-bid',
    MY_BIDS: '/my-bids',
    BID_HISTORY: '/bid-history/:id'
}
export const SLOT_ROUTES = {
    BOOK_SLOT: '/book-slot',
    MY_SLOTS: '/my-slots',
    CANCEL_SLOT: '/cancel-slot'
}
export const PAYMENT_ROUTES = {
    VERIFY_PAYMENT: '/verify-payment'
}

export const TRANSACTION_ROUTES = {
    LIST_TRANSACTIONS: '/list-transactions'
}



