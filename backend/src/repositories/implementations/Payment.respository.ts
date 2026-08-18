import { BaseRepository } from "./Base.repository"
import { IPaymentRepository } from "../interfaces/IPayment.repository"
import { Payment } from "../../models/payment.model";
import { IPaymentDocument } from "../../types/payment.type";
import { Types } from "mongoose";
import { EscrowStatus, PaymentStatus } from "../../constants/payment.constants";

export class PaymentRepository extends BaseRepository<IPaymentDocument> implements IPaymentRepository{
    constructor(){
        super(Payment)
    }
async findHeldPaymentByAuction(auctionId: string): Promise<IPaymentDocument[]> {
    return  this.model.find({
        auctionItemId:new Types.ObjectId(auctionId),
        status:PaymentStatus.PAID,
        escrowStatus:EscrowStatus.HELD        
    })
}
    
}
