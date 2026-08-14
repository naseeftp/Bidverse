import { ITransactionRepository } from "../interfaces/ITransaction.repository";
import { Transaction } from "../../models/transaction.model";
import { BaseRepository } from "./Base.repository";
import { ITransactionDocument } from "../../types/transaction.type";

export class TransactionRepository extends BaseRepository<ITransactionDocument> implements ITransactionRepository{
 constructor(){
    super(Transaction)
 }
}