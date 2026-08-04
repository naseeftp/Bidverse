import { bidHistoryDTO, bidResponseDTO, myBidListDTO, placeBidDTO } from "../../dtos/user.dto/bid.dto";
import { IGenericPaginatedResposnse } from "../../types/response.type";

export interface IBidService {
    placceBid(userId: string, data: placeBidDTO): Promise<bidResponseDTO>
    getUserBids(userId: string, page: number, limit: number, status?: string, search?: string): Promise<IGenericPaginatedResposnse<myBidListDTO>>
    getBidHistory(auctionId: string, page: number, limit: number): Promise<IGenericPaginatedResposnse<bidHistoryDTO>>
}