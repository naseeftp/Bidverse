export const SlotBookingStatus ={
    PENDING : "pending",
    CONFIRMED : "confirmed",
    CANCELLED : "cancelled"
}

export type SlotBookingStatusValues=typeof SlotBookingStatus[keyof typeof SlotBookingStatus]

export interface bookSlotDTO{
    auctionId:string;
    tenantId:string
}

export interface bookSlotResponseDTO{
 slotId:string;
 slotStatus:SlotBookingStatusValues;
 sloteOwnerId:string
}