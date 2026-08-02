import { IBidDocument } from "../types/bid.type";
import { bidResponseDTO } from "../dtos/user.dto/bid.dto";

export class BidMapper {
    static toBidResponseDTO(doc: IBidDocument): bidResponseDTO {
        return {
            bidderId: doc.bidderId.toString(),
            bidAmount: doc.bidAmount.toString(),
            placedAt: doc.createdAt
        }
    }
}