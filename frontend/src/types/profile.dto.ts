import * as yup from 'yup';

export const profileDetailChangeSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Name is too short')
    .max(50, 'Name cannot exceed 50 characters')
    .optional(),

  phone: yup
    .string()
    .matches(/^\d{10}$/, 'Phone must be 10 digits')
    .optional()
});

export type ProfileDetailChangeFormData = yup.InferType< typeof profileDetailChangeSchema>;