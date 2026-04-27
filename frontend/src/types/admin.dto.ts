import type { TVerificationStatus } from "./auctionHouse.type";
import * as Yup from 'yup';
export interface updateAuctionHouseStatusRequestDTO {
    status: TVerificationStatus,
    reason?: string | null
}

export const updateUserStatusSchema = Yup.object().shape({
  isActive: Yup.boolean().required('Status is required'),
  reason: Yup.string()
    .max(200, 'Reason is too long')
    .when('isActive', {
      is: false,
      then: (schema) => schema
        .required('Reason is required when blocking a user')
        .min(5, 'Reason must be at least 5 characters'),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
});


export type UpdateUserStatusDTO = Yup.InferType<typeof updateUserStatusSchema>