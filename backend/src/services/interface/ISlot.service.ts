import { bookSlotDTO, bookSlotResponseDTO } from "../../dtos/user.dto/slot.dto";


export interface ISlotService{
bookSlot(userId:string,data:bookSlotDTO):Promise<bookSlotResponseDTO>

}