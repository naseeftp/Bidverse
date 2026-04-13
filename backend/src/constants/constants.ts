import { StatusCodes } from "http-status-codes";
import { AUCTION_HOUSE_ROUTES } from "./route.constant";
export const Roles = {
    ADMIN: 'admin',
    TENANT: 'tenant',
    USER: 'user'
} as const;


export const OtpPurpose = {
    REGISTRATION: 'registration',
    FORGOT_PASSWORD: 'forgot_password',
} as const;
export const VerificationStatus = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    ACTION_REQUIRED: 'action_required'
}


export type otpPurpose = typeof OtpPurpose[keyof typeof OtpPurpose];

export enum HttpStatus {
    OK = StatusCodes.OK,
    CREATED = StatusCodes.CREATED,
    BAD_REQUEST = StatusCodes.BAD_REQUEST,
    UNAUTHORIZED = StatusCodes.UNAUTHORIZED,
    FORBIDDEN = StatusCodes.FORBIDDEN,
    NOT_FOUND = StatusCodes.NOT_FOUND,
    CONFLICT = StatusCodes.CONFLICT,
    INTERNAL_ERROR = StatusCodes.INTERNAL_SERVER_ERROR,
    GONE = StatusCodes.GONE,
}

export const CONFIG = {
    //   SESSION_MAX_AGE: env.SESSION_MAX_AGE,
    OTP_EXPIRY_MINUTES: 1,
    FORGOT_PASSWORD_EXPIRY: 0.5,
    OTP_RESEND_DELAY_SECONDS: 30,
} as const;


export const MESSAGES = {
    SERVER_ERROR: "Server error",
    MONGODB_URI_MISSING: "MONGODB_URI missing in .env",
    MISSING_FIELDS: "All required fields must be provided",
    INVALID_ROLE: "Invalid role provided",
    UNAUTHORIZED: "Unauthorized",
    NOT_FOUND: "Not found",
    INVALID_ID_FORMAT: "Invalid ID format",
    ROUTE_NOT_FOUND: "Route not found",

    USER_NOT_ACTIVE: "User is not active",
    USER_NOT_FOUND: "User not found",
    USER_BLOCKED: "Your account has been blocked",
    APPOINTMENT_CANNOT_RESCHEDULE: "You can only reschedule an appointment once.",
    DOCTOR_SPECIALITY_LIMIT_EXCEEDED: "limit is 2",
    INVALID_CREDENTIALS: "Invalid email or password",
    LOGIN_SUCCESS: "Login successful",
    OTP_SENT: "OTP sent to your email. Please verify to complete registration.",
    OTP_RESENT: "OTP resent to your email.",
    REGISTRATION_COMPLETE: "Registration complete!",
    PASSWORD_RESET_OTP: "OTP sent to your email for password reset.",
    OTP_VERIFIED: "OTP verified successfully",
    PASSWORD_RESET_SUCCESS: "Password reset successful. You can now login with your new password.",
    USER_EXISTS_EMAIL: "User with this email already exists",
    USER_EXISTS_PHONE: "User with this phone number already exists",
    OTP_INVALID_OR_EXPIRED: "Invalid or expired OTP",
    NO_ACCOUNT_FOUND: "No account found with this email",
    RESET_TOKEN_INVALID: "Invalid or expired reset token",
    OTP_SESSION_EXPIRED: "Registration session expired. Please register again.",
    OTP_SESSION_EXPIRED_RESEND: "Registration session expired. Please register again to receive a new OTP.",

    EMAIL_CREDENTIALS_NOT_CONFIGURED: "Email credentials not configured. Please set SMTP_USER and SMTP_PASS in your .env file",
    EMAIL_SEND_FAILED: "Failed to send email: {error}",
    GOOGLE_PROFILE_EMAIL_MISSING: "No email in Google profile",

    PASSWORDS_NOT_MATCH: "Passwords do not match",
    PASSWORD_TOO_WEAK: "Password must be at least 8 characters and include one uppercase letter and one number",
    INVALID_EMAIL_FORMAT: "Invalid email format",
    INVALID_PHONE_NUMBER: "Invalid phone number",
    INVALID_NAME: "Name must be at least 2 characters",

    INVALID_ACCESS_TOKEN: "Invalid Access token",
    INVALID_REFRESH_TOKEN: "Invalid Refresh token",

    GOOGLE_REGISTERED: 'This account is registered with google authentication please try  google sign in',

    ALLREADY_VERIFIED: 'This accout allready Verified',
    UNDER_REVIEW: 'This account currently under review',
    VERIFICATION_SUBMITTED: 'Verification request submitted successfully',
    VALID_REJECT_RSN:"A valid reason is required for rejection.",
    AUCTION_HOUSE_NOT_FOUND:'Auction house Not found',
    PROFILE_RETRIEVED: 'Profile Retrieved successfully',
    AUC_HOUSE_STTS_UPDTD:'Auction house status updated successfully',
    LIST_RETRIEVED: 'List Retrieved successfully',
    LOGOUT_SUCCESS: "Logout success",
    LOGOUT_FAILED: "Logout failed",


};
