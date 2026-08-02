import { bidResponseDTO, placeBidDTO } from "../../dtos/user.dto/bid.dto";

export interface IBidService{
    placceBid(userId:string,data:placeBidDTO):Promise<bidResponseDTO>
}