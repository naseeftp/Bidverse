import { bookedSlotListDTO, bookSlotDTO, bookSlotResponseDTO } from "../../dtos/user.dto/slot.dto";
import { IGenericPaginatedResposnse } from "../../types/response.type";


export interface ISlotService {
    bookSlot(userId: string, data: bookSlotDTO): Promise<bookSlotResponseDTO>
    listAllSlotForUser(userId: string, page: number, limit: number): Promise<IGenericPaginatedResposnse<bookedSlotListDTO>>

}