import { AuctionItemRepository } from "../repositories/implementations/AuctionItem.repository";
import { LoggerService } from "../services/implementations/Logger.service";
import { AuctionHouseRepository } from "../repositories/implementations/AuctionHouse.repository";
import { AuctionItemMangementController } from "../controllers/implimentations/AuctionItemMangement.controller";
import { AuctionItemMangementSevice } from "../services/implementations/AuctionItemMangement.sevice";
import { PaymentService } from "../services/implementations/Payment.service";
import { PaymentRepository } from "../repositories/implementations/Payment.respository";
import { SlotRepository } from "../repositories/implementations/Slot.repository";
import { TransactionService } from "../services/implementations/Transaction.service";
import { TransactionRepository } from "../repositories/implementations/Transaction.respository";
import { razorpay } from "../config/razorpay.config";

const auctionHouseRepo = new AuctionHouseRepository();
const auctionItemRepo = new AuctionItemRepository();
const aucionItemServiceLogger = new LoggerService('auctionItemManagementService');
const paymentRepo=new PaymentRepository()
const slotRepo=new SlotRepository()
const transactionRepo=new TransactionRepository()
const transactionService=new TransactionService(transactionRepo);

const paymentService=new PaymentService(paymentRepo,slotRepo,auctionItemRepo,transactionService,razorpay)
const auctioItemMangementService = new AuctionItemMangementSevice(auctionItemRepo, auctionHouseRepo,paymentService, aucionItemServiceLogger)
const auctionItemControllerLogger = new LoggerService('auctionItemMangemenController')
export const auctionItemMangementController = new AuctionItemMangementController(auctionItemControllerLogger, auctioItemMangementService)