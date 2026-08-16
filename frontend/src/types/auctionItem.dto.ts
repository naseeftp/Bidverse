import * as yup from 'yup';

export const AuctionItemStatus = {
    DRAFT: 'DRAFT',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    REJECTED: 'REJECTED',
    SCHEDULED: 'SCHEDULED',
    SOLD: 'SOLD',
    PASSED: 'PASSED',
    CANCELLED_BY_HOUSE: 'CANCELLED_BY_HOUSE',
    CANCELLED_BY_ADMIN: 'CANCELLED_BY_ADMIN',
} as const;

export const AuctionType = {
    TIMED: 'TIMED',
    LIVE: 'LIVE',
} as const;

export type AuctionItemStatus = typeof AuctionItemStatus[keyof typeof AuctionItemStatus];
export type AuctionType = typeof AuctionType[keyof typeof AuctionType];

export interface AuctionItemResponseDTO {
    id: string;
    houseId: string;
    title: string;
    description: string;
    status: AuctionItemStatus;
    type: AuctionType;
    totalSlots: number;
    slotFee: number;
    images: {
        id: string;
        url: string;
        isPrimary: boolean;
        altText?: string;
    }[];
    currency: 'INR';
    startingPrice: number;
    currentHighestBid: number;
    minimumIncrement: number;
    buyerPremiumPercent: number;

    currentHighestBidderId?: string;
    winningBidderId?: string;

    startTime: string;
    endTime: string;
    snipingProtectionMinutes: number;

    cancellation?: {
        cancelledBy: 'HOUSE' | 'ADMIN';
        reason: string;
        cancelledAt: string;
    };
    shippingCost: number;
    shippingTerms: string;
    createdAt: string;
    updatedAt: string;
}

export const createAuctionItemSchema = yup.object({
    title: yup
        .string()
        .trim()
        .required('Title is required')
        .min(3, 'Title must be at least 3 characters long')
        .max(150, 'Title cannot exceed 150 characters'),

    description: yup
        .string()
        .trim()
        .required('Description is Required')
        .min(20, 'Provide a descriptive product overview (min 20 characters)')
        .max(2000, 'Description cannot exceed 2000 characters'),

    type: yup
        .string()
        .oneOf(Object.values(AuctionType), 'Invalid auction type selected')
        .required('Auction type is required'),

    totalSlots: yup.number()
        .transform((value, originalValue) => (originalValue === '' ? undefined : value))
        .nullable()
        .optional()
        .when('type', {
            is: AuctionType.LIVE,
            then: (schema) => schema
                .typeError('Total slots must be a valid number')
                .required('Total slots are required for live auctions')
                .integer('Total slots must be a whole number')
                .min(1, 'Live auction must have at least 1 slot'),
            otherwise: (schema) => schema.strip()
        }),

    slotFee: yup.number()
        .transform((value, originalValue) => (originalValue === '' ? undefined : value))
        .nullable()
        .optional()
        .when('type', {
            is: AuctionType.LIVE,
            then: (schema) => schema
                .typeError('Slot fee must be a valid number')
                .required('Slot fee is required for live auctions')
                .min(0, 'Slot fee cannot be negative'),
            otherwise: (schema) => schema.strip()
        }),

    images: yup
        .array()
        .of(
            yup.object({
                id: yup.string().trim().required('image Id Asset Token is required'),
                url: yup.string().required('Image URL is required'),
                isPrimary: yup.boolean().default(false),
                altText: yup.string().trim().max(200, 'Alt text too long').optional(),
            })
        )
        .min(1, 'upload at least one item photo')
        .required('At least one image is required'),

    startingPrice: yup
        .number()
        .transform((value, originalValue) => (originalValue === '' ? undefined : value))
        .typeError('Starting price must be a valid number')
        .required('Starting price is required')
        .min(0, 'starting price must be begin at ₹0 or more'),

    reservePrice: yup
        .number()
        .transform((value, originalValue) => (originalValue === '' ? undefined : value))
        .typeError('Reserve price must be a valid number')
        .required('Reserve price is required')
        .min(0, 'reserve price cannot be negative')
        .test(
            'reserve-price-gte-starting',
            'Reserve price cannot be lower than the starting opening price',
            function (value) {
                const { startingPrice } = this.parent;
                return value === undefined || startingPrice === undefined || value >= startingPrice;
            }
        ),

    minimumIncrement: yup
        .number()
        .transform((value, originalValue) => (originalValue === '' ? undefined : value))
        .typeError('Minimum increment must be a valid number')
        .integer('Minimum bid increment must be a whole number')
        .positive('Minimum increment step must be at least ₹1')
        .required('Minimum increment is required'),

    buyerPremiumPercent: yup
        .number()
        .transform((value, originalValue) => (originalValue === '' ? undefined : value))
        .typeError('Buyer premium must be a valid number')
        .min(0, 'Buyer premium percentage cannot be negative')
        .max(100, 'Premium margin scale cannot exceed 100%')
        .required('Buyer premium percentage is required'),

    startTime: yup
        .date()
        .typeError('Invalid start date format')
        .required('Start time is required')
        .test('not-in-past', 'Start time cannot be set in the past', (value) => {
            if (!value) return false;
            const oneMinuteAgo = new Date(Date.now() - 60000);
            return value >= oneMinuteAgo;
        }),

    endTime: yup
        .date()
        .typeError('Invalid end date format')
        .required('End time is required')
        .test(
            'end-time-after-start',
            'The auction end time must occur after the start timeline has opened',
            function (value) {
                const { startTime } = this.parent;
                return !value || !startTime || value > startTime;
            }
        ),

    snipingProtectionMinutes: yup
        .number()
        .transform((value, originalValue) => (originalValue === '' ? undefined : value))
        .typeError('Sniping protection must be a valid number')
        .integer('Must be a whole number')
        .min(0, 'Sniping window extension cannot be negative')
        .max(60, 'Sniping protection cannot exceed 60 minutes')
        .required('Sniping protection minutes field is required'),

    shippingCost: yup
        .number()
        .transform((value, originalValue) => (originalValue === '' ? undefined : value))
        .typeError('Shipping cost must be a valid number')
        .min(0, 'Shipping fees cannot be negative')
        .required('Shipping cost is required'),

    shippingTerms: yup
        .string()
        .trim()
        .min(5, 'Provide explicit parcel transit/pickup specifications')
        .max(500, 'Shipping notes cannot exceed 500 characters')
        .required('Shipping terms are required'),
});

export const updateAuctionStatusSchema = yup.object({
    itemId: yup.string().required('item id is required'),
    status: yup.string().required('status is required'),
    reason: yup
        .string()
        .nullable()
        .notRequired()
        .when('status', {
            is: (val: string) => val === AuctionItemStatus.REJECTED,
            then: (schema) =>
                schema
                    .required('A valid reason is required when rejecting an auction')
                    .min(5, 'Reason must be at least 5 characters')
                    .max(500, 'Reason is too long')
                    .test(
                        'no-empty-spaces',
                        'Reason cannot be just empty spaces',
                        (value: string | null | undefined) => !!value && value.trim().length >= 5
                    ),
        }),
});

// Idiomatic Yup Partial implementation
// Replace the dynamic reduce implementation with a explicitly typed update schema:
export const updateAuctionItemSchema = yup.object({
    title: yup.string().trim().min(3).max(150).optional(),
    description: yup.string().trim().min(20).max(2000).optional(),
    type: yup.string().oneOf(Object.values(AuctionType)).optional(),
    totalSlots: yup.number().nullable().optional(),
    slotFee: yup.number().nullable().optional(),
    images: yup.array().of(
        yup.object({
            id: yup.string().optional(),
            url: yup.string().required('Image URL is required'),
            isPrimary: yup.boolean().default(false),
            altText: yup.string().optional().nullable(),
        })
    ).optional(),
    startingPrice: yup.number().transform((v, o) => (o === '' ? undefined : v)).min(0).optional(),
    reservePrice: yup.number().transform((v, o) => (o === '' ? undefined : v)).min(0).optional(),
    minimumIncrement: yup.number().transform((v, o) => (o === '' ? undefined : v)).positive().optional(),
    buyerPremiumPercent: yup.number().transform((v, o) => (o === '' ? undefined : v)).min(0).max(100).optional(),
    startTime: yup.string().optional(),
    endTime: yup.string().optional(),
    snipingProtectionMinutes: yup.number().transform((v, o) => (o === '' ? undefined : v)).min(0).max(60).optional(),
    shippingCost: yup.number().transform((v, o) => (o === '' ? undefined : v)).min(0).optional(),
    shippingTerms: yup.string().trim().min(5).max(500).optional(),
})
    .test(
        'reserve-price-validation-on-edit',
        'Reserve price cannot be lower than the starting opening price',
        function (value) {
            if (!value || value.startingPrice === undefined || value.reservePrice === undefined) return true;
            return value.reservePrice >= value.startingPrice;
        }
    )
    .test(
        'end-time-validation-on-edit',
        'The auction end time must occur after the start timeline has opened',
        function (value) {
            if (!value || !value.startTime || !value.endTime) return true;
            const start = new Date(value.startTime);
            const end = new Date(value.endTime);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
            return end > start;
        }
    );

export interface AuctionItemListDTO {
    auctionItemId: string;
    auctionHouseId: string;
    auctionName: string;
    auctionHouseName: string;
    auctionStatus: AuctionItemStatus;
    type: AuctionType;
    startTime: string;
    endTime: string;
    startingPrice: number;
    currentHighestBid: number;
    minimumIncrement: number;
    images: {
        id: string;
        url: string;
        isPrimary: boolean;
        altText?: string;
    }[];
}

export interface AuctionItemDetailDTO {
    auctionItemId: string;
    title: string;
    description: string;
    status: string;
    type: string;
    totalSlots: number | null;
    slotFee: number | null;
    images: Array<{
        id: string;
        url: string;
        isPrimary: boolean;
        altText?: string;
    }>;
    currency: string;
    startingPrice: number;
    reservePrice: number;
    minimumIncrement: number;
    currentHighestBid: number;
    bidCount: number;
    buyerPremiumPercent: number;
    shippingCost: number;
    shippingTerms: string;
    startTime: string;
    endTime: string;
    snipingProtectionMinutes: number;
    isApproved: boolean;
    approvedAt?: string;
    rejectionReason?: string;
    cancellationReason?: string;
    createdAt: string;
    updatedAt: string;

    auctionHouse: {
        id: string;
        name: string;
        ownerId: string;
        yearEstablished: number;
        briefDescription: string;
        categories: string[];
        city: string;
        state: string;
        country: string;
        fullAddress: string;
        primaryContactName: string;
        businessEmail: string;
        phone: string;
        isVerified: boolean;
    };
    highestBidder: {
        name: string;
        userId: string;
        profileImage: string | null;
    };
}

export type CreateAuctionItemDTO = yup.InferType<typeof createAuctionItemSchema>;
export type UpdateAuctionItemDTO = yup.InferType<typeof updateAuctionItemSchema>;
export type UpdateAuctionStatusDTO = yup.InferType<typeof updateAuctionStatusSchema>;

export interface cancelAuctionItemDTO {
    auctionId: string;
    cancelledRole: string,
    cencelingReason: string
}