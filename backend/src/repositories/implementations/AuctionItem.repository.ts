import { IAuctionItemDocument } from "../../types/auctionItem.type";
import { IAuctionItemRepository } from "../interfaces/IAuctionItem.repository";
import { BaseRepository } from "./Base.repository";
import { AuctionItem } from '../../models/auctionItem.model'
import { AuctionItemListDTO } from "../../dtos/auctionHouse.dto/auctionItem.dto";
import mongoose, { PipelineStage } from "mongoose";

export class AuctionItemRepository extends BaseRepository<IAuctionItemDocument> implements IAuctionItemRepository {
    constructor() {
        super(AuctionItem)
    }
    async listAllAuctionItems(page: number, limit: number, search?: string,status?:string,type?:string,houseId?:string): Promise<{ auctions: AuctionItemListDTO[], total: number }> {
        const skip = (page - 1) * limit;
        const pipeline:PipelineStage[]=[];
             if(houseId){
                pipeline.push({
                    $match:{
                       houseId:houseId 
                    }
                })
             }
             if(status){
                pipeline.push({
                    $match:{
                        status:status
                    }
                })
             }
             if(type){
                pipeline.push({
                    $match:{
                        type:type
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
                    {$skip:skip},
                    {$limit:limit},
                    {
                        $project:{
                            _id:0,
                            auctionItemId:{$toString:'$_id'},
                            auctionHouseId:{$toString:'$houseId'},
                            auctionName:'$title',
                            auctionHouseName:{$ifNull:['$auctions.name','Unknown House']},
                            auctionStatus:'$status',
                            type:'$type',
                            images:{$ifNull:['$images',[]]}
                        }
                    }
                ],

                totalCount: [
                    { $count: 'count' }
                ]
            }
        })
        const results=await mongoose.model('AuctionItem').aggregate(pipeline)

        return{
            auctions:results[0].data as AuctionItemListDTO[],
            total:results[0].totalCount[0]?.count||0
        }
    }

}