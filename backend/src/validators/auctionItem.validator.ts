import { createAuctionItemSchema, updateAuctionStatusSchema, updateAuctionSchema } from "../dtos/auctionHouse.dto/auctionItem.dto"
export const AuctionItemValidators = {
    validateCreationInput: createAuctionItemSchema,
    validateUpdateStatusInput: updateAuctionStatusSchema,
    validateUpdateAuctionInput: updateAuctionSchema
}