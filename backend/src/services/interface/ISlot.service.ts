import { bookedSlotListDTO, bookSlotDTO, bookSlotResponseDTO, slotCancelResponseDTO,slotCancelDTO} from "../../dtos/user.dto/slot.dto";
import { IGenericPaginatedResposnse } from "../../types/response.type";


export interface ISlotService {
    bookSlot(userId: string, data: bookSlotDTO): Promise<bookSlotResponseDTO>
    listAllSlotForUser(userId: string, page: number, limit: number): Promise<IGenericPaginatedResposnse<bookedSlotListDTO>>
    cancellSlot(data:slotCancelDTO):Promise<slotCancelResponseDTO>
}