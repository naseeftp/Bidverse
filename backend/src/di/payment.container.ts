import { PaymentService } from "../services/implementations/Payment.service";
import { PaymentRepository } from "../repositories/implementations/Payment.respository";
import { PaymentController } from "../controllers/implimentations/Payment.controller";
import { razorpay } from "../config/razorpay.config";
import { SlotRepository } from "../repositories/implementations/Slot.repository";
import { AuctionItemRepository } from "../repositories/implementations/AuctionItem.repository";

const paymentRepo=new PaymentRepository();
const slotepo=new SlotRepository()
const auctionItemRepo=new AuctionItemRepository()
const paymentService=new PaymentService(paymentRepo,slotepo,auctionItemRepo,razorpay)
export const paymentController=new PaymentController(paymentService)

