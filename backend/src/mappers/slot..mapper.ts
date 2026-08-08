import { ISlotDocument } from "../types/slot.type";
import { bookSlotResponseDTO } from "../dtos/user.dto/slot.dto";

export class SlotMapper{
    static toBookSloTResponseDTO(doc:ISlotDocument):bookSlotResponseDTO{
        return{
            slotId:doc._id.toString(),
            sloteOwnerId:doc.userId.toString(),
            slotStatus:doc.status
        }
    }
}