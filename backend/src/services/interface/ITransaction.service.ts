import { CreateTransactionDTO, TransactionResponseDTO } from "../../dtos/user.dto/transaction.dto";

export interface ITransactionService {
createTransaction(data:CreateTransactionDTO):Promise<TransactionResponseDTO>
}