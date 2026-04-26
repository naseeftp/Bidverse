import { AuctionHouseResponseDTO } from "../../dtos/auctionHouse.dto/auctionHouse.dto";
import { UpdateHouseStatusDTO } from "../../dtos/admin.dto/updatestatus.dto";
import { IGenericPaginatedResposnse } from "../../types/response.type";
import { UserResponseDTO } from "../../dtos/Common.dto";
export interface IPaginatedResponse<T> {
    houses: T[];
    pagination: {
        totalItems: number;
        itemsPerPage: number;
        currentPage: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean
    }
}
export interface IAdminService {
    listAllAuctionHouses(page: number, limit: number): Promise<IPaginatedResponse<AuctionHouseResponseDTO>>
    getAuctionHouseById(id: string): Promise<AuctionHouseResponseDTO>
    updateAuctionHouseStatus(id: string, data: UpdateHouseStatusDTO): Promise<AuctionHouseResponseDTO>
    listAllUsers(page:number,limit:number,search?:string,status?:string):Promise<IGenericPaginatedResposnse<UserResponseDTO>>
    getUserById(id:string):Promise<UserResponseDTO>
}