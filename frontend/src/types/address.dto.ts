import * as yup from 'yup'


export const addressFormSchema = yup.object({
  label: yup.string().required("Please select a label"),
  recipientName: yup.string().min(2).max(50).required("Name is required"),
  phone: yup.string().matches(/^\d{10}$/, "Must be exactly 10 digits").required(),
  altPhone: yup.string().matches(/^\d{10}$/, "Must be exactly 10 digits").nullable(),
  fullAddress: yup.string().min(5).max(255).required(),
  pincode: yup.string().min(4).max(10).required(),
  landMark: yup.string(),
  city: yup.string().required(),
  state: yup.string().required(),
  country: yup.string().required(),
  isDefault: yup.boolean(),
});

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

export type addAddressDTO = yup.InferType<typeof addressFormSchema>