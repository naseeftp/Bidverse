import { IAuctionService } from "../interface/IAuctionHouse.service";
import { IAuctionHouseRepository } from "../../repositories/interfaces/IAuctionHouse.repository";
import { ILoggerService } from "../interface/ILogger.service";
import { AuctionHouseVerificationDTO, AuctionHouseResponseDTO,AdminAuctionHouseDetailDTO} from "../../dtos/auctionHouse.dto/auctionHouse.dto";
import { AuctionHouseMapper } from "../../mappers/auctionHouse.mapper";
import { VerificationStatus } from "../../constants/constants";
import { ConflictError } from "../../errors/AppError";
import { MESSAGES } from "../../constants/constants";
import { Types } from "mongoose";

export class AuctionHouseService implements IAuctionService {
    constructor(
        private _auctionHouseRepository: IAuctionHouseRepository,
        private _logger: ILoggerService
    ) { }
    async submitVerificationRequest(userId: string, data: AuctionHouseVerificationDTO): Promise<AuctionHouseResponseDTO> {
        this._logger.info('Processing verification submission for tenant', { userId })
        const existingRecord = await this._auctionHouseRepository.findByUserId(userId)

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

            return AuctionHouseMapper.toResponseDTO(updatedDoc);
        }

        const verificationData = {
            ...data,
            userId: new Types.ObjectId(userId),
            status: VerificationStatus.PENDING,
            isVerified: false
        }
        const saveDoc = await this._auctionHouseRepository.create(verificationData)
        this._logger.info('Verification request submitted successfully', { tenatId: userId, recordId: saveDoc._id })
        return AuctionHouseMapper.toResponseDTO(saveDoc)
    }
    async getTenantVerificationProfile(userId: string): Promise<AdminAuctionHouseDetailDTO| null> {
        const doc = await this._auctionHouseRepository.findcombinedData(userId)
        if (!doc) {
            return null
        }
        return doc;
    }

}