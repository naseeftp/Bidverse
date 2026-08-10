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
 slotOwnerId:string
 payment: {
        paymentId: string;
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
 };
}