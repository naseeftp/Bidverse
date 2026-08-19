import { SlotRepository } from "../repositories/implementations/Slot.repository";
import { SlotService } from "../services/implementations/Slot.service";
import { SlotController } from "../controllers/implimentations/Slot.controller";
import { AuctionHouseRepository } from "../repositories/implementations/AuctionHouse.repository";
import { AuctionItemRepository } from "../repositories/implementations/AuctionItem.repository";
import { PaymentService } from "../services/implementations/Payment.service";
import { PaymentRepository } from "../repositories/implementations/Payment.respository";
import { razorpay } from "../config/razorpay.config";
import { TransactionService } from "../services/implementations/Transaction.service";
import { TransactionRepository } from "../repositories/implementations/Transaction.respository";

const slotRepo = new SlotRepository()
const auctionRepo = new AuctionItemRepository();
const auctionHouseRepo = new AuctionHouseRepository();
const paymentRepo = new PaymentRepository();
const transactionRepo = new TransactionRepository()
const transactionService = new TransactionService(transactionRepo)
const paymentService = new PaymentService(paymentRepo, slotRepo, auctionRepo, transactionService, razorpay)
const slotService = new SlotService(slotRepo, auctionHouseRepo, auctionRepo, paymentService)
export const slotController = new SlotController(slotService)
