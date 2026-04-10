import { AuctionHouseVerificationSchema } from '../dtos/auctionHouse.dto/auctionHouse.dto';
import z from 'zod';

export const AuctionHouseValidators = {
    validateVerificationInput: AuctionHouseVerificationSchema
}
