
import { PaymentRequestRepository } from "../repositories/implementations/PaymentRequest.repository";
import { AddressRepository } from "../repositories/implementations/Address.repository";
import { PaymentService } from "../services/implementations/Payment.service";
import { OrderService } from "../services/implementations/Order.service";
import { SlotRepository } from "../repositories/implementations/Slot.repository";
import { AuctionItemRepository } from "../repositories/implementations/AuctionItem.repository";
import { TransactionService } from "../services/implementations/Transaction.service";
import { razorpay } from "../config/razorpay.config";
import { OrderRepository } from "../repositories/implementations/Order.repository";
import { PaymentRepository } from "../repositories/implementations/Payment.respository";
import { TransactionRepository } from "../repositories/implementations/Transaction.respository";
import { OrderController } from "../controllers/implimentations/Order.controller";
import { AuctionHouseRepository } from "../repositories/implementations/AuctionHouse.repository";


const paymentRequestRepo=new PaymentRequestRepository();
const addressRepo=new AddressRepository()
const auctionRepo=new AuctionItemRepository();
const paymentRepo=new PaymentRepository()
const slotRepo=new SlotRepository()
const orderRepo=new OrderRepository()
const transactionRepo=new TransactionRepository()
const transactionService=new TransactionService(transactionRepo)
const auctionHouseRepo=new AuctionHouseRepository()

const paymentService=new PaymentService(paymentRepo,slotRepo,auctionRepo,transactionService,razorpay,orderRepo,addressRepo,paymentRequestRepo)
const orderService=new OrderService(paymentRequestRepo,addressRepo,paymentService,orderRepo,auctionHouseRepo)
export const orderController=new OrderController(orderService)
