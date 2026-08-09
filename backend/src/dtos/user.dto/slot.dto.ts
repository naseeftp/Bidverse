import { SlotBookingStatus} from "../../constants/slot.constant";

export interface bookSlotDTO{
    auctionId:string;
    tenantId:string
}

export interface bookSlotResponseDTO{
 slotId:string;
 slotStatus:SlotBookingStatus;
 sloteOwnerId:string
}