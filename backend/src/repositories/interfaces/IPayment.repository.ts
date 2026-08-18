import { IPaymentDocument } from "../../types/payment.type";
import { IBaseRepository } from "./IBase.repository";

export interface IPaymentRepository extends IBaseRepository<IPaymentDocument>{
findHeldPaymentByAuction(auctionId:string):Promise<IPaymentDocument[]>
}