import { IBaseRepository } from "./IBase.repository";
import { ISlotDocument } from "../../types/slot.type";
import { bookedSlotListDTO } from "../../dtos/user.dto/slot.dto";

export interface ISlotRepository extends IBaseRepository<ISlotDocument>{
    findAllReadyBooked(userId:string,auctionId:string):Promise<ISlotDocument|null>
    listAllSlotForUser(userId:string,page:number,limit:number):Promise<{data:bookedSlotListDTO[],total:number}>
}