import { IAuctionHouseRepository } from "../interfaces/IAuctionHouse.repository";
import { IAuctionHouseDocument } from "../../types/auctionhouse.type";
import { BaseRepository } from "./Base.repository";
import { AuctionHouse } from "../../models/auctionHouse.model";
import { AdminAuctionHouseDetailDTO, PublicAuctionHouseDetailDTO } from '../../dtos/auctionHouse.dto/auctionHouse.dto'
import mongoose, { PipelineStage } from "mongoose";
import { PublicAuctionHouseResponseDTO } from "../../dtos/Common.dto";

export class AuctionHouseRepository extends BaseRepository<IAuctionHouseDocument> implements IAuctionHouseRepository {
    constructor() {
        super(AuctionHouse)
    }
    async findByUserId(userId: string): Promise<IAuctionHouseDocument | null> {
        return await this.model.findOne({ userId })
    }
    async findByBusinessEmail(email: string): Promise<IAuctionHouseDocument | null> {
        return await this.model.findOne({ "contact.businessEmail": email }).exec()
    }

    async listAllTenantsWithHouseStatus(
        page: number,
        limit: number,
        search?: string,
        status?: string
    ): Promise<{ houses: AdminAuctionHouseDetailDTO[], total: number }> {
        const skip = (page - 1) * limit;

        const pipeline: PipelineStage[] = [
            { $match: { role: 'tenant' } },
            {
                $lookup: {
                    from: 'auctionhouses',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'house'
                }
            },
            { $unwind: { path: '$house', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    userId: { $toString: '$_id' },
                    userEmail: '$email',
                    userName: '$name',
                    userPhone: '$phone',
                    profileImage: '$profileImage',
                    isGoogleSignup: {
                        $cond: { // works like conditional operator/ternary operator
                            if: {
                                $and: [
                                    { $ifNull: ['$googleId', false] }, //if the field missing or null return false
                                    { $ne: ['$googleId', null] }  //make sure that google id null
                                ]
                            },
                            then: true,
                            else: false
                        }
                    },
                    isAccountBlocked: { $eq: ['$isActive', false] },
                    houseId: { $ifNull: [{ $toString: '$house._id' }, null] },
                    businessName: { $ifNull: ['$house.name', 'N/A'] },
                    yearEstablished: '$house.yearEstablished',
                    briefDescription: '$house.briefDescription',
                    address: '$house.address',
                    contact: '$house.contact',
                    documents: {
                        registrationCertificateUrl: '$house.legal.registrationCertificateUrl',
                        identityProofUrl: '$house.legal.identityProofUrl',
                        registerNumber: '$house.legal.registrationNumber',
                        taxId: '$house.legal.taxId'
                    },
                    status: { $ifNull: ['$house.status', 'not_submitted'] },
                    rejectionReason: '$house.rejectionReason',
                    isVerified: { $ifNull: ['$house.isVerified', false] },
                    createdAt: { $ifNull: ['$house.createdAt', '$createdAt'] }
                }
            }
        ];

        if (status) pipeline.push({ $match: { status } });
        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { userEmail: { $regex: search, $options: 'i' } },
                        { businessName: { $regex: search, $options: 'i' } },
                        { userId: { $regex: search, $options: 'i' } }
                    ]
                }
            });
        }
        const results = await mongoose.model('User').aggregate([
            ...pipeline,
            {
                $facet: {
                    data: [{ $skip: skip }, { $limit: limit }],
                    totalCount: [{ $count: 'count' }]
                }
            }
        ]);

        return {
            houses: results[0].data as AdminAuctionHouseDetailDTO[],
            total: results[0].totalCount[0]?.count || 0
        };

    }

    async findcombinedData(userId: string): Promise<AdminAuctionHouseDetailDTO | null> {
        const result = await mongoose.model('User').aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(userId),
                    role: 'tenant'
                }
            },
            {
                $lookup: {
                    from: 'auctionhouses',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'house'
                }
            },
            {
                $unwind: {
                    path: '$house',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    userId: { $toString: '$_id' },
                    userEmail: '$email',
                    userName: '$name',
                    userPhone: '$phone',
                    profileImage: '$profileImage',
                    isGoogleSignup: {
                        $cond: {
                            if: {
                                $and: [
                                    { $ifNull: ['$googleId', false] },
                                    { $ne: ['$googleId', null] }
                                ]
                            },
                            then: true,
                            else: false
                        }
                    },
                    isAccountBlocked: { $eq: ['$isActive', false] },
                    houseId: { $ifNull: [{ $toString: '$house._id' }, null] },
                    businessName: { $ifNull: ['$house.name', 'NA'] },
                    yearEstablished: '$house.yearEstablished',
                    briefDescription: '$house.briefDescription',
                    category: '$house.categories',
                    address: '$house.address',
                    contact: '$house.contact',

                    documents: {
                        registrationCertificateUrl:
                            '$house.legal.registrationCertificateUrl',

                        identityProofUrl:
                            '$house.legal.identityProofUrl',

                        registerNumber:
                            '$house.legal.registrationNumber',

                        taxId:
                            '$house.legal.taxId'
                    },

                    status: {
                        $ifNull: ['$house.status', 'not_submitted']
                    },

                    rejectionReason: '$house.rejectionReason',

                    isVerified: {
                        $ifNull: ['$house.isVerified', false]
                    },

                    createdAt: {
                        $ifNull: ['$house.createdAt', '$createdAt']
                    }

                }
            }
        ])
        return result[0] || null;
    }

    async listPublicAuctionHouses(
        page: number,
        limit: number,
        search?: string,
        category?: string,
    ): Promise<{ houses: PublicAuctionHouseResponseDTO[], total: number }> {
        const skip = (page - 1) * limit;

        const pipeline: PipelineStage[] = [
            { $match: { role: 'tenant', isActive: true } },
            {
                $lookup: {
                    from: 'auctionhouses',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'house'
                }
            },
            { $unwind: { path: '$house', preserveNullAndEmptyArrays: false } },
            { $match: { 'house.isVerified': true } },

            {
                $project: {
                    _id: 0,
                    houseId: { $toString: '$house._id' },
                    businessName: '$house.name',
                    profileImage: { $ifNull: ['$profileImage', ''] },
                    yearEstablished: '$house.yearEstablished',
                    briefDescription: '$house.briefDescription',
                    isVerified: '$house.isVerified',
                    categories: { $ifNull: ['$house.categories', []] },
                    address: {
                        city: '$house.address.city',
                        state: '$house.address.state',
                        country: '$house.address.country'
                    }
                }
            }
        ];


        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { businessName: { $regex: search, $options: 'i' } },
                        { categories: { $regex: search, $options: 'i' } }
                    ]
                }
            });
        }
        if (category) {
            pipeline.push({
                $match: { categories: category }
            })
        }

        const results = await mongoose.model('User').aggregate([
            ...pipeline,
            {
                $facet: {
                    data: [{ $skip: skip }, { $limit: limit }],
                    totalCount: [{ $count: 'count' }]
                }
            }
        ]);

        return {
            houses: results[0].data as PublicAuctionHouseResponseDTO[],
            total: results[0].totalCount[0]?.count || 0
        };
    }
    async getHouseDetailsWithAuctions(
        houseId: string,
        page: number,
        limit: number,
        itemSearch?: string,
        itemStatus?: string
    ): Promise<{ data: PublicAuctionHouseDetailDTO | null, total: number }> {
        const skip = (page - 1) * limit;
        const targetHouseObjectId = new mongoose.Types.ObjectId(houseId);

        const pipeline: PipelineStage[] = [
            {
                $match: {
                    _id: targetHouseObjectId,
                    isVerified: true
                }
            },

            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'ownerUser'
                }
            },
            { $unwind: { path: '$ownerUser', preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: 'auctionitems',
                    let: { currentHouseId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$houseId', '$$currentHouseId'] },
                                isApproved: true
                            }
                        },

                        ...(itemStatus ? [{ $match: { status: itemStatus } }] : []),
                        ...(itemSearch ? [{ $match: { title: { $regex: itemSearch, $options: 'i' } } }] : []),
                        { $sort: { createdAt: -1 } }
                    ],
                    as: 'filteredItems'
                }
            },


            {
                $project: {
                    profileBlock: {
                        id: { $toString: '$_id' },
                        name: '$name',
                        profileImage: { $ifNull: ['$ownerUser.profileImage', ''] },
                        yearEstablished: '$yearEstablished',
                        briefDescription: '$briefDescription',
                        categories: '$categories',
                        city: '$address.city',
                        state: '$address.state',
                        country: '$address.country',
                        fullAddress: '$address.fullAddress',
                        primaryContactName: '$contact.primaryContactName',
                        businessEmail: '$contact.businessEmail',
                        phone: '$contact.phone',
                        isVerified: '$isVerified'
                    },

                    totalCount: { $size: '$filteredItems' },
                    paginatedItems: {
                        $slice: [
                            {
                                $map: {
                                    input: '$filteredItems',
                                    as: 'item',
                                    in: {
                                        auctionItemId: { $toString: '$$item._id' },
                                        title: '$$item.title',
                                        status: '$$item.status',
                                        type: '$$item.type',
                                        currency: '$$item.currency',
                                        startingPrice: '$$item.startingPrice',
                                        startTime: { $dateToString: { date: '$$item.startTime' } },
                                        endTime: { $dateToString: { date: '$$item.endTime' } },
                                        images: '$$item.images'
                                    }
                                }
                            },
                            skip,
                            limit
                        ]
                    }
                }
            }
        ];

        const aggregationResult = await this.model.aggregate(pipeline).exec();

        if (!aggregationResult || aggregationResult.length === 0) {
            return { data: null, total: 0 };
        }

        const record = aggregationResult[0];

        const outputPayload: PublicAuctionHouseDetailDTO = {
            auctionHouse: record.profileBlock,
            items: record.paginatedItems
        };

        return {
            data: outputPayload,
            total: record.totalCount || 0
        };

    }
}