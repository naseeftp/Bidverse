import { ISlotRepository } from "../interfaces/ISlot.repository";
import { Slot } from "../../models/slot.model";
import { ISlotDocument } from "../../types/slot.type";
import { BaseRepository } from "./Base.repository";

export class SlotRepository extends BaseRepository<ISlotDocument> implements ISlotRepository{
    constructor(){
        super(Slot)
    }
}
