import type { ApiResponse } from "./auth.type";
export const VerificationStatus = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    ACTION_REQUIRED: 'action_required'
} as const

export type TVerificationStatus = typeof VerificationStatus[keyof typeof VerificationStatus];
export interface AuctionHouseSubmissionDTO {
    name: string;
    yearEstablished: number;
    briefDescription: string;
    address: {
        city: string;
        state: string;
        country: string;
        fullAddress: string
    };
    contact: {
        primaryContactName: string;
        businessEmail: string;
        phone: string;
    };
    legal: {
        registrationNumber: string;
        taxId: string;
        registrationCertificateUrl: string;
        identityProofUrl: string
    };

}
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
        phone: string
    }
    documents: {
        registrationCertificateUrl: string;
        identityProofUrl: string;
        registerNumber:string;
        taxId:string
    };
    status: TVerificationStatus;
    isVerified: boolean;
    createdAt: string | Date;
    rejectionReason?: string | null;

}
export type AuctionHouseResponse = ApiResponse<AuctionHouseResponseDTO>;