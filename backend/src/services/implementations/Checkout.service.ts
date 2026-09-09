import { MESSAGES } from "../../constants/constants";
import { CheckoutDetailsResponseDTO } from "../../dtos/user.dto/chekout.dto";
import { AppError, NotFoundError, UnauthorizedError } from "../../errors/AppError";
import { AddressMapper } from "../../mappers/address.mapper";
import { IAddressRepository } from "../../repositories/interfaces/IAddress.repository";
import { IPaymentRequestRepository } from "../../repositories/interfaces/IPaymentRequest.repository";
import { PaymentRequestStatus } from "../../types/paymentRequest.types";
import { ICheckoutService } from "../interface/ICheckout.service";

export class CheckoutService implements ICheckoutService {
    constructor(
        private _paymentRequestRepo: IPaymentRequestRepository,
        private _addressRepo: IAddressRepository
    ) { }

    async getCheckoutDetails(paymentRequestId: string, buyerId: string): Promise<CheckoutDetailsResponseDTO> {
        const paymentRequest = await this._paymentRequestRepo.findWithAuctionDetails(paymentRequestId);
        if (!paymentRequest) {
            throw new NotFoundError(MESSAGES.PAYMENT_REQUEST_NOT_FOUND)
        }
        if (paymentRequest.bidderId.toString() !== buyerId) {
            throw new UnauthorizedError(MESSAGES.NOT_PERMITTED)
        }
        if (paymentRequest.status !== PaymentRequestStatus.PENDING) {
            throw new AppError(`Payment request is already ${paymentRequest.status.toLowerCase()}`);
        }
        const userAddresses = await this._addressRepo.findActiveByUserId(buyerId)
        const auctionItem = paymentRequest.auctionId;
        const itemAmount = paymentRequest.amount;
        const shippingCost = auctionItem.shippingCost || 0;
        const totalAmount = itemAmount + shippingCost;
        const currency = paymentRequest.currency;
        let imageUrl: string | undefined;
        if (auctionItem?.images && auctionItem.images.length > 0) {
            const firstImg = auctionItem.images[0];
            imageUrl = typeof firstImg === "string" ? firstImg : firstImg.url;
        }
        return {
            paymentRequest: {
                id: paymentRequest._id.toString(),
                amount: paymentRequest.amount,
                status: paymentRequest.status,
                dueDate: paymentRequest.expiresAt,
            },
            auctionItem: {
                id: auctionItem.id.toString(),
                title: auctionItem.title,
                description: auctionItem.description,
                imageUrl: imageUrl,
                currency: currency
            },
            tenantId: paymentRequest.tenantId.toString(),
            addresses: userAddresses.map(AddressMapper.toAddressDto),
            pricing: {
                itemAmount: itemAmount,
                shippingCost: shippingCost,
                totalAmount: totalAmount,
                currency: currency
            }
        }
    }
}