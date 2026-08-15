import { IBaseRepository } from "./IBase.repository";
import { ITransactionDocument } from "../../types/transaction.type";
import { transactionListDTO } from "../../dtos/user.dto/transaction.dto";

export interface ITransactionRepository extends IBaseRepository<ITransactionDocument>{
    listTransactions(userId:string,page:number,limit:number):Promise<{data:transactionListDTO[],total:number}>
}