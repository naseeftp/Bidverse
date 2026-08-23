import { IAuctionService } from "../interface/IAuctionHouse.service";
import { IAuctionHouseRepository } from "../../repositories/interfaces/IAuctionHouse.repository";
import { ILoggerService } from "../interface/ILogger.service";
import { AuctionHouseVerificationDTO, AuctionHouseResponseDTO, AdminAuctionHouseDetailDTO } from "../../dtos/auctionHouse.dto/auctionHouse.dto";
import { AuctionHouseMapper } from "../../mappers/auctionHouse.mapper";
import { VerificationStatus } from "../../constants/constants";
import { ConflictError, NotFoundError } from "../../errors/AppError";
import { MESSAGES } from "../../constants/constants";
import { Types } from "mongoose";
import { INotificationService } from "../interface/INotification.service";
import { IUserRepository } from "../../repositories/interfaces/iUser.repository";
import { Role } from "../../dtos/Common.dto";
import { NotificationEvent, NotificationType } from "../../constants/notification.constant";

export class AuctionHouseService implements IAuctionService {
    constructor(
        private _auctionHouseRepository: IAuctionHouseRepository,
        private _logger: ILoggerService,
        private _notifiactionService:INotificationService,
        private _userRepo:IUserRepository
    ) { }
    async submitVerificationRequest(userId: string, data: AuctionHouseVerificationDTO): Promise<AuctionHouseResponseDTO> {
        this._logger.info('Processing verification submission for tenant', { userId })
        const existingRecord = await this._auctionHouseRepository.findByUserId(userId)
           const admin=await this._userRepo.findOne({role:'admin'});
            if(!admin){
                throw new NotFoundError('Admin Not Found')
            }
        if (existingRecord) {
            if (existingRecord.status === VerificationStatus.APPROVED) {
                throw new ConflictError(MESSAGES.ALLREADY_VERIFIED);
            }
            if (existingRecord.status === VerificationStatus.PENDING) {
                throw new ConflictError(MESSAGES.UNDER_REVIEW);
            }
            this._logger.info('Updating existing record for resubmission', { userId });

            const updatedDoc = await this._auctionHouseRepository.updateByUserId(userId, {
                ...data,
                status: VerificationStatus.PENDING,
                isVerified: false,
                rejectionReason: null
            });
          

            if (!updatedDoc) {
                throw new Error("Resubmission failed: Record not found during update.");
            }
          
               await this._notifiactionService.createAndSendNotification({
                recipientId:admin._id,
                recipientRole:Role.ADMIN,
                type:NotificationType.SUCCESS,
                event:NotificationEvent.HOUSE_VERIFICATION_REQUESTED,
                title:'Resubmission Verification Request',
                message:'An auction house has re-submitted a verification request.'
            })
            return AuctionHouseMapper.toResponseDTO(updatedDoc);
        }

        const verificationData = {
            ...data,
            userId: new Types.ObjectId(userId),
            status: VerificationStatus.PENDING,
            isVerified: false
        }
        const saveDoc = await this._auctionHouseRepository.create(verificationData)
           await this._notifiactionService.createAndSendNotification({
                recipientId:admin._id,
                recipientRole:Role.ADMIN,
                type:NotificationType.SUCCESS,
                event:NotificationEvent.HOUSE_VERIFICATION_REQUESTED,
                title:'New Verification Request',
                message:'A new auction house has submitted a verification request.'
            })
        this._logger.info('Verification request submitted successfully', { tenatId: userId, recordId: saveDoc._id })
        return AuctionHouseMapper.toResponseDTO(saveDoc)
    }
    async getTenantVerificationProfile(userId: string): Promise<AdminAuctionHouseDetailDTO | null> {
        const doc = await this._auctionHouseRepository.findcombinedData(userId)
        if (!doc) {
            return null
        }
        return doc;
    }

} 