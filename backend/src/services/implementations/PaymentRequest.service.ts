import { PaymentRequestResponseDTO } from "../../dtos/user.dto/paymentRequest.dto";
import { BadRequestError, NotFoundError } from "../../errors/AppError";
import { PaymentRequestMapper } from "../../mappers/paymentRequest.mapper";
import { IAuctionItemRepository } from "../../repositories/interfaces/IAuctionItem.repository";
import { IPaymentRequestRepository } from "../../repositories/interfaces/IPaymentRequest.repository";
import { IUserRepository } from "../../repositories/interfaces/iUser.repository";
import { INotificationService } from "../interface/INotification.service";
import { IPaymentRequestService } from "../interface/IPaymentRequest.service";
import { DEFAULT_EXPIRATION_HOURS, MESSAGES } from './../../constants/constants'

export class PaymentRequestService implements IPaymentRequestService {
    constructor(
        private _paymentRequestRepo: IPaymentRequestRepository,
        private _auctionRepo: IAuctionItemRepository,
       
    ) { }

    async createPaymentRequest(auctionId: string): Promise<PaymentRequestResponseDTO> {
        const auction = await this._auctionRepo.findById(auctionId)
        if (!auction) {
            throw new NotFoundError(MESSAGES.AUCTION_NOT_FOUND)
        };
        if(!auction.reserveMet){
            throw new BadRequestError("Reserve price was not met for this auction");
        }
        if(!auction.winningBidder){
            throw new BadRequestError('No Winner For this auction')
        }
        const existingRequest = await this._paymentRequestRepo.findByAuctionId(auctionId);
        if (existingRequest) {
            return PaymentRequestMapper.toPaymentRequestResponseDTO(existingRequest, {
                title: auction.title,
                image: auction.title
            })
        }
        const expiresAt = new Date(
            Date.now() + DEFAULT_EXPIRATION_HOURS * 60 * 60 * 1000
        )
        const paymentRequest=await this._paymentRequestRepo.createPaymentRequest({
            tenantId:auction.houseId.toString(),
            auctionId:auction._id.toString(),
            bidderId:auction.winningBidder.toString(),
            amount:auction.currentHighestBid,
            currency:'INR',
            expiresAt,
        })

        // if auction have payment indication status handle it here
        return PaymentRequestMapper.toPaymentRequestResponseDTO(paymentRequest,{
            title:auction.title,
            image:auction.images?.[0].url
        })
    }
}