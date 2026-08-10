import { Types, Document } from "mongoose";
import { AuctionItemStatus, AuctionType } from "../constants/constants";



export interface ICancellationMeta {
  cancelledBy: "HOUSE" | "ADMIN";
  userId: Types.ObjectId;               //use it while cancelling an item
  reason: string;
  cancelledAt: Date;
}

export interface IAuctionItem {
  _id: Types.ObjectId;
  houseId: Types.ObjectId;
  title: string;
  description: string;
  status: AuctionItemStatus;
  type: AuctionType;
  totalSlots?: number; 
  slotFee?: number;
  images: {
    id: string;
    url: string;
    isPrimary: boolean;
    altText?: string
  }[];

  currency: 'INR';
  startingPrice: number;
  reservePrice: number;
  currentHighestBid: number;
  minimumIncrement: number;
  buyerPremiumPercent: number;

  currentHighestBidder?: Types.ObjectId;
  winningBidder?: Types.ObjectId;
  bidCount:number;
  slotCount:number
  reserveMet:boolean,

  startTime: Date;
  endTime: Date;
  snipingProtectionMinutes: number;

  isApproved: boolean;
  approvedAt?: Date;
  rejectionReason?: string;
  cancellation?: ICancellationMeta

  shippingCost: number;
  shippingTerms: string;

  createdAt: Date;
  updatedAt: Date;

}

export type IAuctionItemDocument = IAuctionItem & Document