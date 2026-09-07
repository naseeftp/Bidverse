import { PaymentRequestRepository } from "../repositories/implementations/PaymentRequest.repository";
import { AuctionItemRepository } from "../repositories/implementations/AuctionItem.repository";
import { PaymentRequestService } from "../services/implementations/PaymentRequest.service";
import { PaymentRequestController } from "../controllers/implimentations/PaymentRequest.controller";

const payementRequestRepo = new PaymentRequestRepository()
const auctionItemRepo = new AuctionItemRepository();
const paymentRequestService = new PaymentRequestService(payementRequestRepo, auctionItemRepo)
const paymentRequestController = new PaymentRequestController(paymentRequestService);
export default paymentRequestController 