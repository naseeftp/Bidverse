import { z } from "zod";
import { TVerificationStatus } from "../../types/auctionhouse.type";


export const AuctionHouseVerificationSchema = z.object({
    name: z.string()
        .trim()
        .min(3, 'Auction House name must be atleast 3 charactors')
        .max(100, "Name is too long"),
        
    yearEstablished: z.coerce.number() // try to use max
        .int()
        .min(1700, 'Invalid year')
        .max(new Date().getFullYear(), 'Year Cannot be future'),

    briefDescription: z.string()
        .min(20, "Please Provide a more detailed description (minimum 20 chars)")
        .max(1000, 'Description is too long'),

    address: z.object({
        city: z.string().min(1, 'City is Required'),
        state: z.string().min(1, 'State is required'),
        country: z.string().min(1, 'Country is Required'),
        fullAddress: z.string().min(5, 'Full Address Required')
    }),

    contact: z.object({
        primaryContactName: z.string().min(2, "Primary contact name required"),
        businessEmail: z.string().email('Invalid email format'),
        phone: z.string().min(10, "Phone number should be 10 digits")
    }),

    legal: z.object({
        registrationNumber: z.string().min(1, 'Bussiness Registration Number required'),
        taxId: z.string().min(1, "Tax Id is required"),

        registrationCertificateUrl: z.string()
            .url("Registration certificate link is required")
            .includes("cloudinary.com", { message: "Document must be hosted on Cloudinary" }),

        identityProofUrl: z.string()
            .url("Identity proof link is required")
            .includes("cloudinary.com", { message: "Document must be hosted on Cloudinary" }),
    }),

})

export interface AuctionHouseResponseDTO {
    id: string;
    userId: string;
    name: string;
    yearEstablished: number;
    briefDescription: string;
    address: {
        city: string;
        state: string;
        country: string;
        fullAddress: string;
    };
    contact: {
        primaryContactName: string;
        businessEmail: string;
        phone: string;
    };
    documents: {
        registrationCertificateUrl: string;
        identityProofUrl: string
    };
    status: TVerificationStatus;
    rejectionReason?: string | null;
    isVerified: boolean;
    createdAt: string | Date;
}

export type AuctionHouseVerificationDTO = z.infer<typeof AuctionHouseVerificationSchema>