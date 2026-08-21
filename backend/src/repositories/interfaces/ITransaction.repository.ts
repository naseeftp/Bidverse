import { IBaseRepository } from "./IBase.repository";
import { ITransactionDocument } from "../../types/transaction.type";
import { transactionListDTO } from "../../dtos/user.dto/transaction.dto";
import { TransactionDirection } from "../../constants/transaction.constant";

export interface ITransactionRepository extends IBaseRepository<ITransactionDocument>{
    listTransactions(userId:string,page:number,limit:number,direction?:TransactionDirection):Promise<{data:transactionListDTO[],total:number}>
}