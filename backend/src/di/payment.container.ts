import { PaymentService } from "../services/implementations/Payment.service";
import { PaymentRepository } from "../repositories/implementations/Payment.respository";
import { PaymentController } from "../controllers/implimentations/Payment.controller";
import { razorpay } from "../config/razorpay.config";

const paymentRepo=new PaymentRepository();
const paymentService=new PaymentService(paymentRepo,razorpay)
export const paymentController=new PaymentController(paymentService)

