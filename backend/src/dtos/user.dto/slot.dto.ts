import { SlotBookingStatus} from "../../constants/slot.constant";

export interface bookSlotDTO{
    auctionId:string;
    tenantId:string
}

export interface bookSlotResponseDTO{
 slotId:string;
 slotStatus:SlotBookingStatus;
 slotOwnerId:string
 payment: {
        paymentId: string;
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
 }
}

export interface bookedSlotListDTO{
    slotId:string;
    auctionId:string;
    auctionTitle:string;
    auctionImage?:string;
    startTime:Date,
    endTime:Date;
    status:SlotBookingStatus;
    bookedAt:Date;
}

 export interface slotCancelDTO{
    userId:string;
    auctionId:string;
    slotId:string;
 }
 export interface slotCancelResponseDTO{
    slotStatus:SlotBookingStatus,
    slotId:string;
    auctionId:string
 }