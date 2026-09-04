import { Types } from "mongoose";
import { socketService } from "./socket.service";
import { ILiveAuctionStateRepository } from "../../repositories/interfaces/ILiveAuctionStateRepository";
import { IAuctionItemRepository } from "../../repositories/interfaces/IAuctionItem.repository";
import { ROUND_DURATIONS_MS, LiveAuctionStatus, AuctionItemStatus } from "../../constants/constants";
import { LiveAuctionSateRepository } from "../../repositories/implementations/LiveAuctionState.repository";
import { AuctionItemRepository } from "../../repositories/implementations/AuctionItem.repository";

interface TimerHandle {
    timeout: NodeJS.Timeout;
    round: number;
}

export class AuctionRoundTimerService {
    private _timers = new Map<string, TimerHandle>();

    constructor(
        private _liveStateRepo: ILiveAuctionStateRepository,
        private _auctionRepo: IAuctionItemRepository
    ) { }

    async startRounds(auctionItemId: string): Promise<void> {
        await this._enterRound(auctionItemId, 1);
    }

    async resetOnBid(auctionItemId: string): Promise<void> {
        this._clear(auctionItemId);
        await this._enterRound(auctionItemId, 1);
    }

    stop(auctionItemId: string): void {
        this._clear(auctionItemId);
    }
    async pause(auctionId:string){
        this._clear(auctionId)
    }
    private _clear(auctionItemId: string): void {
        const existing = this._timers.get(auctionItemId);
        if (existing) {
            clearTimeout(existing.timeout);
            this._timers.delete(auctionItemId);
        }
    }

    private async _enterRound(auctionItemId: string, round: number): Promise<void> {
        const durationMs = ROUND_DURATIONS_MS[round - 1];
        const roundEndsAt = new Date(Date.now() + durationMs);

        const liveState = await this._liveStateRepo.findOne({
            auctionItemId: new Types.ObjectId(auctionItemId)
        });
        if (!liveState) return; 

        await this._liveStateRepo.updateById(liveState._id, { currentRound: round, roundEndsAt });

        socketService.emitToAuctionRoom(auctionItemId, 'auction:round', {
            auctionItemId,
            round,
            roundEndsAt: roundEndsAt.toISOString()
        });

        const timeout = setTimeout(() => {
            this._onRoundExpire(auctionItemId, round).catch(() => { });
        }, durationMs);

        this._timers.set(auctionItemId, { timeout, round });
    }
  
    private async _onRoundExpire(auctionItemId: string, expiredRound: number): Promise<void> {
        if (expiredRound < ROUND_DURATIONS_MS.length) {
            await this._enterRound(auctionItemId, expiredRound + 1);
            return;
        }
        await this._finalizeAuction(auctionItemId);
    }

    private async _finalizeAuction(auctionItemId: string): Promise<void> {
        this._clear(auctionItemId);

        const auction = await this._auctionRepo.findById(auctionItemId);
        if (!auction) return;

        const liveState = await this._liveStateRepo.findOne({
            auctionItemId: new Types.ObjectId(auctionItemId)
        });
        if (liveState) {
            await this._liveStateRepo.updateById(liveState._id, {
                status: LiveAuctionStatus.ENDED,
                endedAt: new Date()
            });
        }
        const isReserveMet=auction.reserveMet;
        const auctionStatus=isReserveMet?AuctionItemStatus.SOLD:AuctionItemStatus.PASSED;
        await this._auctionRepo.updateById(auctionItemId, {
            status: auctionStatus, 
            winningBidder: auction.currentHighestBidder
        });

        socketService.emitToAuctionRoom(auctionItemId, 'auction:ended', {
            auctionItemId,
            status:auctionStatus,
            reserveMet:isReserveMet,
            winningBidder: auction.currentHighestBidder?.toString(),
            winningBid: auction.currentHighestBid
        });
    }
}
const liveAuctionStateRepository=new LiveAuctionSateRepository()
const auctionItemRepository=new AuctionItemRepository()
export const auctionRoundTimerService = new AuctionRoundTimerService(
    liveAuctionStateRepository,
    auctionItemRepository
);