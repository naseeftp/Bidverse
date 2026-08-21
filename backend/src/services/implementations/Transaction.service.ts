import { Types } from "mongoose";
import { CreateTransactionDTO, transactionListDTO, TransactionResponseDTO } from "../../dtos/user.dto/transaction.dto";
import { BadRequestError } from "../../errors/AppError";
import { ITransactionRepository } from "../../repositories/interfaces/ITransaction.repository";
import { ITransactionService } from "../interface/ITransaction.service";
import { TransactionDirection, TransactionStatus } from "../../constants/transaction.constant";
import { TransactionMapper } from "../../mappers/transaction.mapper";
import { IGenericPaginatedResposnse } from "../../types/response.type";

export class TransactionService implements ITransactionService {
    constructor(
        private _transactionRepo: ITransactionRepository
    ) { }
    async createTransaction(data: CreateTransactionDTO): Promise<TransactionResponseDTO> {
        if (data.amount <= 0) {
            throw new BadRequestError('Transaction amount must be greater than zero')

        }
        const transaction = await this._transactionRepo.create({
            partyType: data.partyType,
            userId: data.userId ? new Types.ObjectId(data.userId) : undefined,
            auctionHouseId: data.auctionHouseId ? new Types.ObjectId(data.auctionHouseId) : undefined,
            paymentId: data.paymentId ? new Types.ObjectId(data.paymentId) : undefined,
            auctionItemId: data.auctionItemId ? new Types.ObjectId(data.auctionItemId) : undefined,
            slotBookingId: data.slotBookingId ? new Types.ObjectId(data.slotBookingId) : undefined,
            purpose: data.purpose,
            direction: data.direction,
            amount: data.amount,
            currency: data.currency,
            status: data.status ?? TransactionStatus.COMPLETED,
            description: data.description,
            razorpayPaymentId: data.paymentId,
            razorpayOrderId: data.razorpayOrderId
        })

        return TransactionMapper.toResponseDTO(transaction)
    }
    async listTransactons(userId: string, page: number, limit: number,direction?:TransactionDirection): Promise<IGenericPaginatedResposnse<transactionListDTO>> {
        const { data, total } = await this._transactionRepo.listTransactions(userId, page, limit,direction);
        return {
            data: data,
            pagination: {
                totalItems: total,
                itemsPerPage: limit,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit > total,
                hasPrevPage: page > 1
            }
        }
    }
}