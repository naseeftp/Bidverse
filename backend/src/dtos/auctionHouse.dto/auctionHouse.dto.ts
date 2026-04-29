import { z } from "zod";
import { TVerificationStatus } from "../../types/auctionhouse.type";


export const AuctionHouseVerificationSchema = z.object({
  name: z.string()
    .trim()
    .min(3, 'Auction House name must be at least 3 characters')
    .max(100, "Name is too long"),

  yearEstablished: z.coerce.number()
    .int()
    .min(1700, 'Invalid year')
    .max(new Date().getFullYear(), 'Year cannot be in the future'),

  briefDescription: z.string()
    .min(20, "Provide at least 20 characters")
    .max(1000, 'Description is too long'),

  address: z.object({
    city: z.string()
      .min(1, 'City is required')
      .max(50, 'City name too long'),

    state: z.string()
      .min(1, 'State is required')
      .max(50, 'State name too long'),

    country: z.string()
      .min(1, 'Country is required')
      .max(50, 'Country name too long'),

    fullAddress: z.string()
      .min(5, 'Full address required')
      .max(255, 'Address is too long'),
  }),

  contact: z.object({
    primaryContactName: z.string()
      .min(2, "Primary contact name required")
      .max(100, "Name too long"),

    businessEmail: z.string()
      .email('Invalid email format')
      .max(100, 'Email too long'),

    phone: z.string()
      .regex(/^\d{10}$/, "Phone number must be exactly 10 digits")
      .max(10, "Phone cannot exceed 10 digits"),
  }),

  legal: z.object({
    registrationNumber: z.string()
      .min(1, 'Business registration number required')
      .max(100, 'Registration number too long'),

    taxId: z.string()
      .min(1, "Tax ID is required")
      .max(50, "Tax ID too long"),

    registrationCertificateUrl: z.string()
      .url("Registration certificate link is required")
      .max(500, "URL too long")
      .includes("cloudinary.com", { message: "Must be hosted on Cloudinary" }),

    identityProofUrl: z.string()
      .url("Identity proof link is required")
      .max(500, "URL too long")
      .includes("cloudinary.com", { message: "Must be hosted on Cloudinary" }),
  }),
});

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
    identityProofUrl: string;
    registerNumber: string;
    taxId: string
  };
  status: TVerificationStatus;
  rejectionReason?: string | null;
  isVerified: boolean;
  createdAt: string | Date;
}

export type AuctionHouseVerificationDTO = z.infer<typeof AuctionHouseVerificationSchema>