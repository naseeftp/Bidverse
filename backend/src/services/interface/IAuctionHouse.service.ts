import { AuctionHouseResponseDTO, AuctionHouseVerificationDTO,AdminAuctionHouseDetailDTO} from "../../dtos/auctionHouse.dto/auctionHouse.dto";

export interface IAuctionService {
    submitVerificationRequest(userId: string, data: AuctionHouseVerificationDTO): Promise<AuctionHouseResponseDTO>
    getTenantVerificationProfile(userId: string): Promise<AdminAuctionHouseDetailDTO | null>
}