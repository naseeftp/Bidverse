import { ITransactionDocument } from "../types/transaction.type";
import { TransactionResponseDTO } from "../dtos/user.dto/transaction.dto";

export class TransactionMapper {

    static toResponseDTO(
        transaction: ITransactionDocument
    ): TransactionResponseDTO {
        return {
            transactionId: transaction._id.toString(),
            partyType: transaction.partyType,
            userId: transaction.userId?.toString(),
            auctionHouseId: transaction.auctionHouseId?.toString(),
            paymentId: transaction.paymentId?.toString(),
            auctionItemId: transaction.auctionItemId?.toString(),
            slotBookingId: transaction.slotBookingId?.toString(),
            purpose: transaction.purpose,
            direction: transaction.direction,
            amount: transaction.amount,
            currency: transaction.currency,
            status: transaction.status,
            description: transaction.description,
            createdAt: transaction.createdAt
        };
    }
}