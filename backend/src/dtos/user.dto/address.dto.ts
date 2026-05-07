import { z } from 'zod'
import { AddressLabelValues } from '../../constants/constants'

export const createAddressSchema = z.object({
    label: z.enum(AddressLabelValues as [string, ...string[]]),
    recipientName: z.string().min(2, "Recipient name must be at least 2 characters").max(50, 'Recipient Name is too long').trim(),

    phone: z.string()
        .regex(/^\d{10}$/, "Phone number must be exactly 10 digits")
        .max(10, "Phone cannot exceed 10 digits").trim(),

    altPhone: z.string().regex(/^\d{10}$/, "AltPhone number must be exactly 10 digits")
        .max(10, "Phone cannot exceed 10 digits").trim().optional(),

    fullAddress: z.string().min(5, "Please provide a detailed address").max(255, 'Address is too long').trim(),
    pincode: z.string().min(4, "Invalid pincode").max(10).trim(),
    landMark: z.string().trim().optional().or(z.literal("")),
    city: z.string().min(1, "City is required").max(50, 'city is too long').trim(),
    state: z.string().min(1, "State is required").max(50, 'state is too long').trim(),
    country: z.string().min(1, "Country is required").max(50, 'city is too long').trim(),
    isDefault: z.boolean().optional().default(false),
})

export interface AddressResponseDTO {
  id: string; 
  userId: string;
  label: string;
  recipientName: string;
  phone: string;
  altPhone?: string;
  fullAddress: string;
  pincode: string;
  landMark?: string;
  city: string;
  state: string;
  country: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type CreateAddressDTO = z.infer<typeof createAddressSchema>;