import { IBidService } from "../interface/IBid.service";
import { IBidRepository } from "../../repositories/interfaces/IBid.repository";
import { bidResponseDTO, myBidListDTO, placeBidDTO, bidHistoryDTO } from "../../dtos/user.dto/bid.dto";
import { IUserRepository } from "../../repositories/interfaces/iUser.repository";
import { BadRequestError, NotFoundError } from "../../errors/AppError";
import { AuctionItemStatus, BidStatus, MESSAGES } from "../../constants/constants";
import { IAuctionItemRepository } from "../../repositories/interfaces/IAuctionItem.repository";
import { Types } from "mongoose";
import { BidMapper } from "../../mappers/bid.mapper";
import { IGenericPaginatedResposnse } from "../../types/response.type";
import { NotificationService } from "./Notification.service";
import { INotificationService } from "../interface/INotification.service";
import { Role } from "../../dtos/Common.dto";
import { NotificationEvent, NotificationType } from "../../constants/notification.constant";

export class BidService implements IBidService {
    constructor(
        private _bidRepo: IBidRepository,
        private _userRepo: IUserRepository,
        private _auctionRepo: IAuctionItemRepository,
        private _notificationService: INotificationService
    ) { }
    async placceBid(userId: string, data: placeBidDTO): Promise<bidResponseDTO> {
        const userExist = await this._userRepo.findById(userId);

        if (!userExist) {
            throw new NotFoundError(MESSAGES.USER_NOT_FOUND)
        }
        const auctionExist = await this._auctionRepo.findById(data.auctionId);
        const now = new Date();
        if (!auctionExist) {
            throw new NotFoundError(MESSAGES.AUCTION_NOT_FOUND)
        };
        if (auctionExist.status !== AuctionItemStatus.SCHEDULED) {
            throw new BadRequestError('Bidding is not active for this auction')
        }
        if (now < auctionExist.startTime) {
            throw new BadRequestError('Auction not started yet')
        }
        if (now > auctionExist.endTime) {
            throw new BadRequestError('Bidding window closed')
        }
        const minimumRequiredBid = auctionExist.bidCount > 0 ?
            auctionExist.currentHighestBid + auctionExist.minimumIncrement
            : auctionExist.startingPrice + auctionExist.minimumIncrement

        if (Number(data.amount) < minimumRequiredBid) {
            throw new BadRequestError(`Bid amount must be at least ${minimumRequiredBid}`)
        };
        if (auctionExist.bidCount > 0) {
            const currentHighestBidderId = auctionExist.currentHighestBidder;
            await this._notificationService.createAndSendNotification({
                recipientId: currentHighestBidderId!,
                recipientRole: Role.USER,
                type: NotificationType.WARNING,
                event: NotificationEvent.OUTBID,
                title: 'Outbid for an auction',
                message: `You are out bided for ${auctionExist.title}`
            })
        }


        const isReserveMet = parseInt(data.amount) >= auctionExist.reservePrice;
        const status = isReserveMet ? BidStatus.WINNING : BidStatus.ACTIVE;
        const result = await this._bidRepo.create({
            tenantId: new Types.ObjectId(data.tenantId),
            bidAmount: Number(data.amount),
            auctionId: new Types.ObjectId(data.auctionId),
            bidderId: new Types.ObjectId(userId),
            status: status
        })

        auctionExist.currentHighestBid = Number(data.amount);
        auctionExist.currentHighestBidder = new Types.ObjectId(userId)
        auctionExist.bidCount += 1;
        if (isReserveMet && !auctionExist.reserveMet) {
            auctionExist.reserveMet = true;
        }
        if (isReserveMet) {
            auctionExist.winningBidder = new Types.ObjectId(userId)
        }
        if (auctionExist.snipingProtectionMinutes) {
            const timeRemainingMs = new Date(auctionExist.endTime).getTime() - now.getTime();
            const tresholdMs = auctionExist.snipingProtectionMinutes * 60 * 1000;
            if (timeRemainingMs < tresholdMs) {
                auctionExist.endTime = new Date(now.getTime() + tresholdMs)
            }
        }

        await auctionExist.save()
        await this._bidRepo.makeOutBid(result._id, data.auctionId)
        return BidMapper.toBidResponseDTO(result)

    }
    async getUserBids(userId: string, page: number, limit: number, status?: string, search?: string): Promise<IGenericPaginatedResposnse<myBidListDTO>> {
        const userExist = await this._userRepo.findById(userId)
        if (!userExist) {
            throw new NotFoundError(MESSAGES.USER_NOT_FOUND)
        }
        const { docs, total } = await this._bidRepo.getUserBids(userId, page, limit, status, search)
        return {
            data: docs,
            pagination: {
                totalItems: total,
                itemsPerPage: limit,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            }
        }
    }
    async getBidHistory(auctionId: string, page: number, limit: number): Promise<IGenericPaginatedResposnse<bidHistoryDTO>> {
        const auctionExist = await this._auctionRepo.findById(auctionId);
        if (!auctionExist) {
            throw new NotFoundError(MESSAGES.AUCTION_NOT_FOUND)
        }
        const { docs, total } = await this._bidRepo.getBidHistory(auctionId, page, limit);
        return {
            data: docs,
            pagination: {
                totalItems: total,
                itemsPerPage: limit,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            }
        }
    }
}   