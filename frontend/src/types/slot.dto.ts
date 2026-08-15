export const SlotBookingStatus = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    CANCELLED: "cancelled"
}

export type SlotBookingStatusValues = typeof SlotBookingStatus[keyof typeof SlotBookingStatus]

export interface bookSlotDTO {
    auctionId: string;
    tenantId: string
}

export interface bookSlotResponseDTO {
    slotId: string;
    slotStatus: SlotBookingStatusValues;
    slotOwnerId: string
    payment: {
        paymentId: string;
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
    };
}

export interface bookedSlotListDTO {
    slotId: string;
    auctionId: string;
    auctionTitle: string;
    auctionImage?: string;
    startTime: Date,
    endTime: Date;
    status: SlotBookingStatusValues;
    bookedAt: Date;
}

 export interface slotCancelDTO{
    auctionId:string;
    slotId:string;
 }
 export interface slotCancelResponseDTO{
    slotStatus:SlotBookingStatusValues;
    slotId:string;
    auctionId:string
 }