import { IBaseRepository } from "./IBase.repository";
import { ISlotDocument } from "../../types/slot.type";

export interface ISlotRepository extends IBaseRepository<ISlotDocument>{
    findAllReadyBooked(userId:string,auctionId:string):Promise<ISlotDocument|null>
}