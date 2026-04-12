import { AuctionHouseResponseDTO } from "../../dtos/auctionHouse.dto/auctionHouse.dto";
export interface IPaginatedResponse<T>{
    houses:T[];
    pagination:{
        totalItems:number;
        itemsPerPage:number;
        currentPage:number;
        totalPages:number;
        hasNextPage:boolean;
        hasPrevPage:boolean
    }
}
export interface IAdminService{
    listAllAuctionHouses(page:number,limit:number):Promise<IPaginatedResponse<AuctionHouseResponseDTO>>
}