import { z } from 'zod';
import { VerificationStatus } from '../../constants/constants';
import { TVerificationStatus } from '../../types/auctionhouse.type';

export const UpdateHouseStatusSchema = z.object({
    status: z.enum(Object.values(VerificationStatus) as [TVerificationStatus, ...TVerificationStatus[]]),
    reason: z.string()
        .min(5, 'Reason must be atleast 5 characters')
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

export const updateUserStatusSchema=z.object({
    isActive:z.boolean(),
    reason:z.string().min(5,'Reason must be atleast 5 characters')
    .max(200,'Reson is too long').optional()
})
.refine(
    (data) => {
      if (data.isActive === false) {
        return !!data.reason && data.reason.trim().length >= 5;
      }
      return true;
    },
    {
      message: "Reason is required when blocking a user",
      path: ["reason"],
    }
  );

export type UpdateHouseStatusDTO = z.infer<typeof UpdateHouseStatusSchema>;
export type UpdateUserStatusDTO=z.infer<typeof updateUserStatusSchema>