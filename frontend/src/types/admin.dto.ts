import type { TVerificationStatus } from "./auctionHouse.type";

export interface updateAuctionHouseStatusRequest{
    status:TVerificationStatus,
    reason?:string|null
}