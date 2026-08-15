import { TransactionRepository } from "../repositories/implementations/Transaction.respository";
import { TransactionService } from "../services/implementations/Transaction.service";
import { TransactionController } from "../controllers/implimentations/Transaction.controller";

const transactionRepo = new TransactionRepository();
const transactionService = new TransactionService(transactionRepo);
export const transactionController = new TransactionController(transactionService)