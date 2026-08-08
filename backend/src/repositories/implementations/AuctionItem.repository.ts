import { IAuctionItemDocument } from "../../types/auctionItem.type";
import { IAuctionItemRepository } from "../interfaces/IAuctionItem.repository";
import { BaseRepository } from "./Base.repository";
import { AuctionItem } from '../../models/auctionItem.model'
import { AuctionItemDetailDTO, AuctionItemListDTO } from "../../dtos/auctionHouse.dto/auctionItem.dto";
import mongoose, { PipelineStage } from "mongoose";

export class AuctionItemRepository extends BaseRepository<IAuctionItemDocument> implements IAuctionItemRepository {
    constructor() {
        super(AuctionItem)
    }
    async listAllAuctionItems(page: number, limit: number, search?: string, status?: string | string[], type?: string, houseId?: string): Promise<{ auctions: AuctionItemListDTO[], total: number }> {
        const skip = (page - 1) * limit;
        const pipeline: PipelineStage[] = [];
        if (houseId) {
            pipeline.push({
                $match: {
                    houseId: houseId
                }
            })
        }
        if (status) {
            pipeline.push({
                $match: {
                    status: Array.isArray(status) ? { $in: status } : status
                }
            })
        }
        if (type) {
            pipeline.push({
                $match: {
                    type: type
                }
            })
        }

        pipeline.push(
            {
                $lookup: {
                    from: 'auctionhouses',
                    localField: 'houseId',
                    foreignField: '_id',
                    as: 'auctions'
                }

            },
            {
                $unwind: {
                    path: '$auctions',
                    preserveNullAndEmptyArrays: true
                }
            }
        );


        if (search && search.trim() !== '') {
            const searchRegex = { $regex: search.trim(), $options: 'i' };
            pipeline.push({
                $match: {
                    $or: [
                        { title: searchRegex },
                        { 'auctions.name': searchRegex }
                    ]
                }
            })
        }
        pipeline.push({
            $facet: {
                data: [
                    {$sort:{createdAt:-1}},
                    { $skip: skip },
                    { $limit: limit },
                    
                    {
                        $project: {
                            _id: 0,
                            auctionItemId: { $toString: '$_id' },
                            auctionHouseId: { $toString: '$houseId' },
                            auctionName: '$title',
                            auctionHouseName: { $ifNull: ['$auctions.name', 'Unknown House'] },
                            auctionStatus: '$status',
                            type: '$type',
                            startTime: '$startTime',
                            endTime: '$endTime',
                            images: { $ifNull: ['$images', []] },
                            startingPrice: '$startingPrice',
                            currentHighestBid: '$currentHighestBid',
                            minimumIncrement: '$minimumIncrement'

                        }
                    }
                ],

                totalCount: [
                    { $count: 'count' }
                ]
            }
        })
        const results = await mongoose.model('AuctionItem').aggregate(pipeline)

        return {
            auctions: results[0].data as AuctionItemListDTO[],
            total: results[0].totalCount[0]?.count || 0
        }
    }
    async getAuctionItemDetails(itemId: string): Promise<AuctionItemDetailDTO | null> {
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return null
        }
        const pipiline: PipelineStage[] = [
            {
                $match: { _id: new mongoose.Types.ObjectId(itemId) }
            },
            {
                $lookup: {
                    from: 'auctionhouses',
                    localField: 'houseId',
                    foreignField: '_id',
                    as: 'auction'
                }
            },
            {
                $unwind: {
                    path: "$auction",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'currentHighestBidder',
                    foreignField: '_id',
                    as: 'highestBidder'
                }
            },
            {
                $unwind: {
                    path: "$highestBidder",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 0,
                    auctionItemId: { $toString: '$_id' },
                    title: 1,
                    description: 1,
                    status: 1,
                    type: 1,
                     totalSlots:1,
                     slotFee: 1,
                    images: { $ifNull: ['$images', []] },
                    currency: 1,
                    startingPrice: 1,
                    reservePrice: 1,
                    minimumIncrement: 1,
                    currentHighestBid: 1,
                    bidCount: 1,
                    buyerPremiumPercent: 1,
                    shippingCost: 1,
                    shippingTerms: 1,
                    startTime: { $dateToString: { date: '$startTime' } },
                    endTime: { $dateToString: { date: '$endTime' } },
                    snipingProtectionMinutes: 1,
                    isApproved: 1,
                    approvedAt: { $dateToString: { date: '$approvedAt', onNull: undefined } },
                    rejectionReason: 1,
                    createdAt: { $dateToString: { date: '$createdAt' } },
                    updatedAt: { $dateToString: { date: '$updatedAt' } },

                    auctionHouse: {
                        id: { $toString: '$auction._id' },
                        name: { $ifNull: ['$auction.name', 'Unknown Organization'] },
                        ownerId: { $toString: '$auction.userId' },
                        yearEstablished: '$auction.yearEstablished',
                        briefDescription: '$auction.briefDescription',
                        categories: { $ifNull: ['$auction.categories', []] },
                        city: '$auctions.address.city',
                        state: '$auction.address.state',
                        country: '$auction.address.country',
                        fullAddress: '$auction.address.fullAddress',
                        primaryContactName: '$auction.contact.primaryContactName',
                        businessEmail: '$auction.contact.businessEmail',
                        phone: '$auction.contact.phone',
                        isVerified: { $ifNull: ['$auction.isVerified', false] }
                    },
                    highestBidder: {
                        name: '$highestBidder.name',
                        userId: { $toString: '$highestBidder._id' },
                        profileImage: {
                            $ifNull: ["$highestBidder.profileImage", null]
                        }
                    }
                }
            }
        ]
        const result = await this.model.aggregate(pipiline)
        return (result[0] as AuctionItemDetailDTO) || null
    }


}