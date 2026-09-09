import { PaymentRequestRepository } from "../repositories/implementations/PaymentRequest.repository";
import { AddressRepository } from "../repositories/implementations/Address.repository";
import { CheckoutService } from "../services/implementations/Checkout.service";
import { CheckoutController } from "../controllers/implimentations/Checkout.controller";


const paymentRequestRepo = new PaymentRequestRepository();
const addressRepo = new AddressRepository();
const checkOutService = new CheckoutService(paymentRequestRepo, addressRepo);
const checkOutController = new CheckoutController(checkOutService)
export default checkOutController
