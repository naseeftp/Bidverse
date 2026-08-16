import { CreateAuctionItemDTO, AuctionItemResponseDTO, AuctionItemDetailDTO, updateAuctionStatusDTO, UpdateAuctionDTO, cancelAuctionItemDTO } from '../../dtos/auctionHouse.dto/auctionItem.dto'
import { IGenericPaginatedResposnse } from '../../types/response.type'
import { AuctionItemListDTO } from '../../dtos/auctionHouse.dto/auctionItem.dto'
export interface IAuctionItemMangementSevice {
    createAuction(userId: string, data: CreateAuctionItemDTO): Promise<AuctionItemResponseDTO>
    listAdminAuctions(page: number, limit: number, search?: string, status?: string, type?: string): Promise<IGenericPaginatedResposnse<AuctionItemListDTO>>
    listTenantAuctions(page: number, limit: number, search?: string, status?: string, type?: string, userId?: string): Promise<IGenericPaginatedResposnse<AuctionItemListDTO>>
    getAuctionDetails(itemId: string): Promise<AuctionItemDetailDTO | null>
    updateAuctionStatus(data: updateAuctionStatusDTO): Promise<AuctionItemResponseDTO>
    editAuction(userId: string, itemId: string, data: UpdateAuctionDTO): Promise<AuctionItemResponseDTO>
    cancellAuction(userId:string,data:cancelAuctionItemDTO):Promise<AuctionItemResponseDTO>
}