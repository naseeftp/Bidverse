import { BaseRepository } from "./Base.repository";
import { IBidRepository } from "../interfaces/IBid.repository";
import { IBidDocument } from "../../types/bid.type";
import { Bid } from '../../models/bid.model'
import mongoose, { Types, UpdateResult, PipelineStage } from "mongoose";
import { myBidListDTO } from "../../dtos/user.dto/bid.dto";

export class BidRepository extends BaseRepository<IBidDocument> implements IBidRepository {
    constructor() {
        super(Bid)
    }
    async makeOutBid(exceptedBidId: Types.ObjectId, auctionId: string): Promise<UpdateResult> {
        return this.model.updateMany(
            {
                auctionId: { $eq: new Types.ObjectId(auctionId) },
                _id: { $ne: exceptedBidId },
                status: { $ne: 'outbid' }
            }, {
            $set: {
                status: 'outbid'
            }
        }
        )
    }
    async getUserBids(userId: string, page: number, limit: number, status?: string, search?: string): Promise<{ docs: myBidListDTO[]; total: number; }> {
        const skip = (page - 1) * limit;
        const pipeline: PipelineStage[] = [];

        pipeline.push({
            $match: {
                bidderId: new Types.ObjectId(userId)
            }
        })
      
        pipeline.push({
            $sort: { createdAt: -1 }
        })
        pipeline.push({
            $group: {
                _id: "$auctionId",
                latestBid: { $first: "$$ROOT" }//$$ROOT is a system variable represent entire document being processed
            }                                  //$first tells mongodb to take very frst document that lands in pipleline bucket and stored in latest bid

        });
        pipeline.push({
            $replaceRoot: {
                newRoot: '$latestBid'
            }
        });
        pipeline.push({
            $lookup: {
                from: 'auctionitems',
                localField: 'auctionId',
                foreignField: '_id',
                as: 'auction'
            }
        },
            {
                $unwind: {
                    path: '$auction',
                    preserveNullAndEmptyArrays: false
                }
            });

        pipeline.push(
            {
                $lookup: {
                    from: "auctionhouses",
                    localField: "tenantId",
                    foreignField: "_id",
                    as: "house"
                }
            },
            {
                $unwind: {
                    path: "$house",
                    preserveNullAndEmptyArrays: true
                }
            }
        );
        if (search && search.trim() !== "") {
            const searchRegex = { $regex: search.trim(), $options: "i" };
            pipeline.push({
                $match: {
                    $or: [
                        { "auction.title": searchRegex },
                        { "house.name": searchRegex }
                    ]
                }
            });
        }
          if (status) {
            pipeline.push({
                $match: {
                    status: status
                }
            })
        }
        pipeline.push({
            $facet: {
                data: [
                    { $sort: { createdAt: -1 } },
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $project: {
                            _id: 0,
                            auctionId:'$auction._id',
                            auctionTitle: "$auction.title",
                            auctionImage: {
                                $ifNull: [
                                    { $arrayElemAt: ["$auction.images.url", 0] },
                                    ""
                                ]
                            },
                            auctionHouseName: { $ifNull: ["$house.name", "Unknown House"] },
                            myLastBidAmount: "$bidAmount",
                            currentHighestBid: { $ifNull: ["$auction.currentHighestBid", 0] },
                            myBidStatus: "$status",
                            endTime: "$auction.endTime"
                        }
                    }
                ],
                totalCount: [
                    { $count: "count" }
                ]
            }
        });

        const results = await mongoose.model('Bid').aggregate(pipeline)
        return {
            docs: (results[0]?.data || []) as myBidListDTO[],
            total: results[0]?.totalCount[0]?.count || 0
        }
    }

}