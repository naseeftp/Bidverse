import { UpdateHouseStatusSchema,updateUserStatusSchema} from "../dtos/admin.dto/updatestatus.dto";

export const adminValidators = {
    validateAuctionHouseStatusInput: UpdateHouseStatusSchema,
    validateUserStatusUpdateInput:updateUserStatusSchema
}