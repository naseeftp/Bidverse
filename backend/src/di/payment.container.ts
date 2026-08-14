import { PaymentService } from "../services/implementations/Payment.service";
import { PaymentRepository } from "../repositories/implementations/Payment.respository";
import { PaymentController } from "../controllers/implimentations/Payment.controller";
import { razorpay } from "../config/razorpay.config";
import { SlotRepository } from "../repositories/implementations/Slot.repository";
import { AuctionItemRepository } from "../repositories/implementations/AuctionItem.repository";
import { TransactionService } from "../services/implementations/Transaction.service";
import { TransactionRepository } from "../repositories/implementations/Transaction.respository";

const paymentRepo=new PaymentRepository();
const slotrepo=new SlotRepository()
const auctionItemRepo=new AuctionItemRepository()
const transactionRepo=new TransactionRepository()
const transactionService=new TransactionService(transactionRepo)
const paymentService=new PaymentService(paymentRepo,slotrepo,auctionItemRepo,transactionService,razorpay)
export const paymentController=new PaymentController(paymentService)

