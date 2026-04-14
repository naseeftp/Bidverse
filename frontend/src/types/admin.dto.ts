import type { TVerificationStatus } from "./auctionHouse.type";

export interface updateAuctionHouseStatusRequestDTO {
    status: TVerificationStatus,
    reason?: string | null
}