import { CreateTransactionDTO, transactionListDTO, TransactionResponseDTO } from "../../dtos/user.dto/transaction.dto";
import { IGenericPaginatedResposnse } from "../../types/response.type";

export interface ITransactionService {
    createTransaction(data: CreateTransactionDTO): Promise<TransactionResponseDTO>
    listTransactons(userId: string, page: number, limit: number): Promise<IGenericPaginatedResposnse<transactionListDTO>>
}