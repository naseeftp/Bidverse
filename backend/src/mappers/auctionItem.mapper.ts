import { IAuctionItemDocument } from "../types/auctionItem.type";
import { AuctionItemResponseDTO } from "../dtos/auctionHouse.dto/auctionItem.dto";

export class AuctionItemMapper {
    static toResponseDTO(doc: IAuctionItemDocument): AuctionItemResponseDTO {
        return {
            id: doc._id.toString(),
            houseId: doc.houseId.toString(),
            title: doc.title,
            description: doc.description,
            status: doc.status,
            type: doc.type,
            images: doc.images.map(img => ({
                id: img.id,
                url: img.url,
                isPrimary: img.isPrimary,
                altText: img.altText
            })),
            currency: doc.currency,
            startingPrice: doc.startingPrice,
            currentHighestBid: doc.currentHighestBid,
            minimumIncrement: doc.minimumIncrement,
            buyerPremiumPercent: doc.buyerPremiumPercent,
            currentHighestBidderId: doc.currentHighestBidder?.toString(),
            winningBidderId: doc.winningBidder?.toString(),
            startTime: doc.startTime && typeof doc.startTime.toISOString === 'function'
                ? doc.startTime.toISOString()
                : new Date(doc.startTime).toISOString(),
            endTime: doc.endTime && typeof doc.endTime.toISOString === 'function'
                ? doc.endTime.toISOString()
                : new Date(doc.endTime).toISOString(),
            snipingProtectionMinutes: doc.snipingProtectionMinutes,
            shippingCost: doc.shippingCost,
            shippingTerms: doc.shippingTerms,
            createdAt: doc.createdAt?.toISOString ? doc.createdAt.toISOString() : new Date().toISOString(),
            updatedAt: doc.updatedAt?.toISOString ? doc.updatedAt.toISOString() : new Date().toISOString(),
            cancellation: doc.cancellation ? {
                cancelledBy: doc.cancellation.cancelledBy,
                reason: doc.cancellation.reason,
                cancelledAt: doc.cancellation.cancelledAt?.toISOString ? doc.cancellation.cancelledAt.toISOString() : new Date().toISOString()
            } : undefined

        }

    }
}