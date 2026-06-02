import { createAuctionItemSchema,updateAuctionStatusSchema} from "../dtos/auctionHouse.dto/auctionItem.dto"
export const AuctionItemValidators={
    validateCreationInput:createAuctionItemSchema,
    validateUpdateStatusInput:updateAuctionStatusSchema
}