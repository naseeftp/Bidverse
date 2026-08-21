import { TransactionDirection } from "../../constants/transaction.constant";
import { CreateTransactionDTO, transactionListDTO, TransactionResponseDTO } from "../../dtos/user.dto/transaction.dto";
import { IGenericPaginatedResposnse } from "../../types/response.type";

export interface ITransactionService {
    createTransaction(data: CreateTransactionDTO): Promise<TransactionResponseDTO>
    listTransactons(userId: string, page: number, limit: number,direction?:TransactionDirection): Promise<IGenericPaginatedResposnse<transactionListDTO>>
}