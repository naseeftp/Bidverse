import { IAuctionItemMangementSevice } from "../interface/IAuctionItemMangement.service";
import { ILoggerService } from "../interface/ILogger.service";
import { IAuctionItemRepository } from "../../repositories/interfaces/IAuctionItem.repository";
import { CreateAuctionItemDTO, AuctionItemResponseDTO, AuctionItemListDTO, AuctionItemDetailDTO, updateAuctionStatusDTO, UpdateAuctionDTO, cancelAuctionItemDTO } from "../../dtos/auctionHouse.dto/auctionItem.dto";
import { IAuctionHouseRepository } from "../../repositories/interfaces/IAuctionHouse.repository";
import { AppError, BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "../../errors/AppError";
import { AuctionItemStatus, MESSAGES } from "../../constants/constants";
import { IAuctionItem } from "../../types/auctionItem.type";
import { AuctionItemMapper } from "../../mappers/auctionItem.mapper";
import { IGenericPaginatedResposnse } from "../../types/response.type";
import { Role } from "../../dtos/Common.dto";
import { Types } from "mongoose";
import { IPaymentService } from "../interface/IPayment.service";
import { INotificationService } from "../interface/INotification.service";
import { IUserRepository } from "../../repositories/interfaces/iUser.repository";
import { NotificationEvent, NotificationType } from "../../constants/notification.constant";

export class AuctionItemMangementSevice implements IAuctionItemMangementSevice {
    constructor(
        private _auctionItemRepo: IAuctionItemRepository,
        private _auctionHouseRepo: IAuctionHouseRepository,
        private _paymentService:IPaymentService,
        private _logger: ILoggerService,
        private _notificationService:INotificationService,
        private _userRepo:IUserRepository

    ) { }

    async createAuction(userId: string, data: CreateAuctionItemDTO): Promise<AuctionItemResponseDTO> {
        this._logger.info('auction item creation requested', { houseowner: userId })
        const houseExist = await this._auctionHouseRepo.findOne({ userId: userId });
        this._logger.info('auction house exist', { house: houseExist })
        if (!houseExist) {
            throw new NotFoundError(MESSAGES.AUCTION_HOUSE_NOT_FOUND)
        }
        const houseId = houseExist._id;
        if (!houseExist.isVerified) {
            throw new ForbiddenError(MESSAGES.NOT_PERMITTED)
        }
        const auctionItemData: Partial<IAuctionItem> = {
            ...data,
            houseId: houseId,
            status: AuctionItemStatus.PENDING_APPROVAL,
            isApproved: false,
            currentHighestBid: 0,
            images: data.images.map(img => ({
                id: img.id,
                url: img.url,
                isPrimary: img.isPrimary,
                altText: img.altText
            }))
        }
        const createdItem = await this._auctionItemRepo.create(auctionItemData)
        const admin=await this._userRepo.findOne({role:'admin'});
        await this._notificationService.createAndSendNotification({
            recipientId:admin?._id!,
            recipientRole:Role.ADMIN,
            type:NotificationType.WARNING,
            event:NotificationEvent.AUCTION_VERIFICATION_REQUESTED,
            message:`a new Auction Item ${createdItem.title} submitted to verification`,
            title:'Auction Verification'
        })
        const hydratedObject = createdItem.toObject ? createdItem.toObject() : createdItem;
        return AuctionItemMapper.toResponseDTO(hydratedObject)
    }
    async listAdminAuctions(page: number, limit: number, search?: string, status?: string, type?: string): Promise<IGenericPaginatedResposnse<AuctionItemListDTO>> {
        const { auctions, total } = await this._auctionItemRepo.listAllAuctionItems(page, limit, search, status, type)
        return {
            data: auctions,
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
    async listTenantAuctions(page: number, limit: number, search?: string, status?: string, type?: string, userId?: string): Promise<IGenericPaginatedResposnse<AuctionItemListDTO>> {
        const house = await this._auctionHouseRepo.findOne({ userId: userId });
        if (!house) {
            throw new NotFoundError(MESSAGES.AUCTION_HOUSE_NOT_FOUND)
        };
        const houseId = house._id as unknown as string;
        const { auctions, total } = await this._auctionItemRepo.listAllAuctionItems(page, limit, search, status, type, houseId)
        return {
            data: auctions,
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

    async getAuctionDetails(itemId: string): Promise<AuctionItemDetailDTO | null> {
        const auction = await this._auctionItemRepo.findById(itemId);
        if (!auction) {
            throw new NotFoundError(MESSAGES.AUCTION_NOT_FOUND)
        }
        const result = await this._auctionItemRepo.getAuctionItemDetails(itemId);
        return result
    }
    async updateAuctionStatus(data: updateAuctionStatusDTO): Promise<AuctionItemResponseDTO> {
        const { itemId, status, reason } = data;
        const auction = await this._auctionItemRepo.findById(itemId);
        if (!auction) {
            throw new NotFoundError(MESSAGES.AUCTION_NOT_FOUND)
        }
        const isApproving = status === AuctionItemStatus.SCHEDULED;
        const updateData = {
            status: status,
            rejectionReason: status === AuctionItemStatus.REJECTED ? reason : null,
            isApproved: isApproving,
            approvedAt: isApproving ? new Date() : null

        }
        const updatedAuction = await this._auctionItemRepo.updateById(itemId, updateData)
        if (!updatedAuction) {
            throw new AppError('Failed to update auction')
        }
        const isApproved=status===AuctionItemStatus.SCHEDULED;
        const notificationType=isApproved?NotificationType.SUCCESS:NotificationType.WARNING;
        const notificationEvent=isApproved?NotificationEvent.AUCTION_APPROVED:NotificationEvent.AUCTION_REJECTED;
        const message=isApproved?
        `You are auction item named ${updatedAuction.title} is Approved `
        :`You are auction item named ${updatedAuction.title} is rejected due to ${reason}`;
        const auctionOwner=await this._auctionHouseRepo.findById(updatedAuction.houseId);
        await this._notificationService.createAndSendNotification({
            recipientId:auctionOwner?.userId!,
            recipientRole:Role.TENANT,
            type:notificationType,
            event:notificationEvent,
            title:'Auction Status Update',
            message:message
        })

        return AuctionItemMapper.toResponseDTO(updatedAuction)
    }

    async editAuction(userId: string, itemId: string, data: UpdateAuctionDTO): Promise<AuctionItemResponseDTO> {
        this._logger.info('auction item edit requested', { houseOwner: userId, item: itemId });
        const houseExist = await this._auctionHouseRepo.findOne({ userId: userId });
        if (!houseExist) {
            throw new NotFoundError(MESSAGES.AUCTION_HOUSE_NOT_FOUND)
        }
        const existingAuction = await this._auctionItemRepo.findById(itemId);
        if (!existingAuction) {
            throw new NotFoundError(MESSAGES.AUCTION_NOT_FOUND)
        }
        if (existingAuction.houseId.toString() !== houseExist._id.toString()) {
            throw new ForbiddenError(MESSAGES.NOT_PERMITTED)
        }
        const uneditableStatuses = [AuctionItemStatus.SCHEDULED, AuctionItemStatus.PASSED, AuctionItemStatus.SOLD];
        if (uneditableStatuses.includes(existingAuction.status)) {
            throw new ForbiddenError('Cannot modify an auction item that is scheduled, active, or concluded.');
        }
        const updatePayload: Partial<IAuctionItem> = {
            ...data,
            status: AuctionItemStatus.PENDING_APPROVAL,
            isApproved: false,

        }

        if (data.images) {
            updatePayload.images = data.images.map(img => ({
                id: img.id,
                url: img.url,
                isPrimary: img.isPrimary,
                altText: img.altText
            }));
        }
        const updatedItem = await this._auctionItemRepo.updateById(itemId, updatePayload)
        if (!updatedItem) throw new AppError('Failed to execute auction modification updates');
        const hydratedObject = updatedItem.toObject ? updatedItem.toObject() : updatedItem;
        return AuctionItemMapper.toResponseDTO(hydratedObject);
    }
    async cancellAuction(userId: string, data: cancelAuctionItemDTO): Promise<AuctionItemResponseDTO> {
        const auctionExist = await this._auctionItemRepo.findById(data.auctionId);
        if (!auctionExist) {
            throw new NotFoundError(MESSAGES.AUCTION_NOT_FOUND)
        }
        if (data.cancelledRole === Role.TENANT) {
            const house = await this._auctionHouseRepo.findById(auctionExist.houseId);
            if (house?.userId.toString() !== userId) {
                throw new UnauthorizedError(MESSAGES.NOT_PERMITTED)
            }
        }
        if (auctionExist.status == AuctionItemStatus.PASSED || auctionExist.status == AuctionItemStatus.SOLD) {
            throw new BadRequestError('Completed auction cannot be cancelled')
        }
        if (auctionExist.status == AuctionItemStatus.CANCELLED_BY_HOUSE || auctionExist.status === AuctionItemStatus.CANCELLED_BY_ADMIN) {
            throw new BadRequestError('Auction is already cancelled')
        }
        const newStatus = data.cancelledRole == Role.TENANT ? AuctionItemStatus.CANCELLED_BY_HOUSE : AuctionItemStatus.CANCELLED_BY_ADMIN;
        auctionExist.status = newStatus;
        auctionExist.cancellation = {
            cancelledBy: data.cancelledRole === Role.TENANT ? 'HOUSE' : 'ADMIN',
            userId: new Types.ObjectId(userId),
            reason: data.cencelingReason,
            cancelledAt: new Date()
        }
        const cancelledAuction = await auctionExist.save();
        await this._paymentService.refundForCancelAuction(auctionExist._id.toString())
        return AuctionItemMapper.toResponseDTO(cancelledAuction)
    }
}
