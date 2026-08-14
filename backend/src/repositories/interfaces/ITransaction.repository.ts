import { IBaseRepository } from "./IBase.repository";
import { ITransactionDocument } from "../../types/transaction.type";

export interface ITransactionRepository extends IBaseRepository<ITransactionDocument>{
    
}