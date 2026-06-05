import { AuctionItemStatus, AuctionItemStatusValues, AuctionType } from "../../constants/constants";
import { z } from 'zod'

export const createAuctionItemSchema = z.object({
    title: z.string()
        .trim()
        .min(3, "Title must be at least 3 characters long")
        .max(150, "Title cannot exceed 150 characters"),

    description: z.string()
        .trim()
        .min(20, "Provide a descriptive product overview (min 20 characters)")
        .max(2000, "Description cannot exceed 2000 characters"),

    type: z.nativeEnum(AuctionType, {
        message: "Invalid auction type selected"
    }),

    images: z.array(
        z.object({
            id: z.string().trim().min(1, "Image ID asset token is required"),
            url: z.string()
                .url("Invalid image attachment link")
                .includes("cloudinary.com", { message: "Images must be hosted via Cloudinary CDN" }),
            isPrimary: z.boolean().default(false),
            altText: z.string().trim().max(200, "Alt text too long").optional(),
        })
    ).min(1, "Upload at least one item demonstration photo"),

    startingPrice: z.coerce.number()
        .nonnegative("Starting price cannot be negative").
        min(0, "Starting bidding must begin at ₹0 or more"),

    reservePrice: z.coerce.number()
        .nonnegative('Reserve price cannot be negative'),

    minimumIncrement: z.coerce.number()
        .int('Minimum bid increment Must be a whole number')
        .positive('Minimum increment step must be at least ₹1'),

    buyerPremiumPercent: z.coerce.number()
        .nonnegative("Buyer premium percentage cannot be negative")
        .max(100, "Premium margin scale cannot exceed 100%"),

    startTime: z.coerce.date({ message: "Invalid start date format" })
        .refine((date) => date >= new Date(new Date().setMinutes(new Date().getMinutes() - 1)), {
            message: "Start time cannot be set in the past",
        }),

    endTime: z.coerce.date({ message: "Invalid end date format" }),

    snipingProtectionMinutes: z.coerce.number()
        .int()
        .nonnegative("Sniping window extension cannot be negative")
        .max(60, "Sniping protection cannot exceed 60 minutes"),

    shippingCost: z.coerce.number()
        .nonnegative("Shipping fees cannot be negative"),

    shippingTerms: z.string()
        .trim()
        .min(5, "Provide explicit parcel transit/pickup specifications")
        .max(500, "Shipping notes cannot exceed 500 characters"),


})
    .refine((data) => data.endTime > data.startTime, {
        message: "The auction end time must occur after the start timeline has opened",
        path: ["endTime"], // Points the UI error highlight directly to the input container element
    }).refine((data) => data.reservePrice >= data.startingPrice, {
        message: "Reserve price cannot be lower than the starting opening price",
        path: ["reservePrice"],
    });

export interface AuctionItemResponseDTO {
    id: string;
    houseId: string;
    title: string;
    description: string;
    status: AuctionItemStatus;
    type: AuctionType;
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
    }
    shippingCost: number;
    shippingTerms: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuctionItemListDTO {
    auctionItemId: string;
    auctionHouseId: string;
    auctionName: string;
    auctionHouseName: string;
    auctionStatus: AuctionItemStatus;
    type: AuctionType,
    startTime: string;
    endTime: string;
    startingPrice:number
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
    buyerPremiumPercent: number;
    shippingCost: number;
    shippingTerms: string;
    startTime: string;
    endTime: string;
    snipingProtectionMinutes: number;
    isApproved: boolean;
    approvedAt?: string;
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;


    auctionHouse: {
        id: string;
        name: string;
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

}

export const updateAuctionStatusSchema = z.object({
    itemId: z.string().min(1, 'Item Id is required'),
    status: z.enum(AuctionItemStatusValues as [string, ...string[]]),
    reason: z.string().min(5, 'Reason must be atleast 5 characters')
        .max(500, 'Reason is too long').nullish()
}).refine((data) => {
    if (data.status == AuctionItemStatus.REJECTED) {
        return !!data.reason && data.reason.trim().length >= 5
    }
    return true;
}, {
    message: "A valid reason is required when rejecting an auction",
    path: ["reason"]
}

);

export type CreateAuctionItemDTO = z.infer<typeof createAuctionItemSchema>
export type updateAuctionStatusDTO = z.infer<typeof updateAuctionStatusSchema>