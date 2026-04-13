import { z } from 'zod';
import { VerificationStatus } from '../../constants/constants';
import { TVerificationStatus } from '../../types/auctionhouse.type';

export const UpdateHouseStatusSchema = z.object({
    status: z.enum(Object.values(VerificationStatus) as [TVerificationStatus, ...TVerificationStatus[]]),
    reason: z.string()
        .min(5, 'Reason must be atleast 5 charcters')
        .max(500, 'Reason is too long')
        .optional()
        .or(z.null())

}).refine((data) => {
    if (data.status === VerificationStatus.REJECTED) {
        return !!data.reason && data.reason.trim().length >= 5;
    }
    return true;
}, {
    message: "A valid reason is required when rejecting an auction house",
    path: ["reason"],
});
export type UpdateHouseStatusDTO = z.infer<typeof UpdateHouseStatusSchema>;