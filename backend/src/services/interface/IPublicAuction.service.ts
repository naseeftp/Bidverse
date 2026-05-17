import { PublicAuctionHouseResponseDTO } from "../../dtos/Common.dto";
import { IGenericPaginatedResposnse } from "../../types/response.type";

export interface IPublicAunctionService{ 
 listAllPublicAuctionHouses(page:number,limit:number,search:string):Promise<IGenericPaginatedResposnse<PublicAuctionHouseResponseDTO>>

}