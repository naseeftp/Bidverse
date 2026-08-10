import { BaseRepository } from "./Base.repository"
import { IPaymentRepository } from "../interfaces/IPayment.repository"
import { Payment } from "../../models/payment.model";
import { IPaymentDocument } from "../../types/payment.type";

export class PaymentRepository extends BaseRepository<IPaymentDocument> implements IPaymentRepository{
    constructor(){
        super(Payment)
    }
}
