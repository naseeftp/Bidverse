import { ITransactionRepository } from "../interfaces/ITransaction.repository";
import { Transaction } from "../../models/transaction.model";
import { BaseRepository } from "./Base.repository";
import { ITransactionDocument } from "../../types/transaction.type";
import { Types } from "mongoose";
import { TransactionMapper } from "../../mappers/transaction.mapper";
import { transactionListDTO } from "../../dtos/user.dto/transaction.dto";
import { TransactionDirection } from "../../constants/transaction.constant";

export class TransactionRepository extends BaseRepository<ITransactionDocument> implements ITransactionRepository {
   constructor() {
      super(Transaction)
   }
   async listTransactions(userId: string, page: number, limit: number,direction?:TransactionDirection): Promise<{ data: transactionListDTO[], total: number }> {
      const skip = (page - 1) * limit;
      const targetedUserId = new Types.ObjectId(userId);
      const filter:{
         userId:Types.ObjectId,
         direction?:TransactionDirection
      }={
        userId:targetedUserId,
      }
      if(direction){
         filter.direction=direction
      }
      const [data, total] = await Promise.all([
         this.model.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
         this.model.countDocuments(filter)
      ])
      const mappedData = data.map((transaction: ITransactionDocument) => TransactionMapper.toTransactionListResponse(transaction))
      return {
         data: mappedData,
         total: total
      }
   }
}