import { ISlotDocument } from "../types/slot.type";
import { slotCancelResponseDTO } from "../dtos/user.dto/slot.dto";

export class SlotMapper{
    static toCancelSloTResponseDTO(doc:ISlotDocument):slotCancelResponseDTO{
        return{
            slotId:doc._id.toString(),
            slotStatus:doc.status,
            auctionId:doc.auctionId.toString()
        }
    }
}