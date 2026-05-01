import * as yup from 'yup';

export const profileDetailChangeSchema = yup.object({
    name: yup
    .string()
    .trim()
    .test(
      'not-empty',
      'Name cannot contain only spaces',
      value => !value || value.trim().length > 0
    )
    .min(2, 'Name is too short')
    .max(50, 'Name cannot exceed 50 characters')
    .optional(),

  phone: yup
    .string()
    .matches(/^\d{10}$/, 'Phone must be 10 digits')
    .optional()
});

export const changePasswordSchema = yup.object({
  oldPassword: yup
    .string()
    .min(8, 'Old password must contain at least 8 characters')
    .required('Old password is required'),
  newPassword: yup.string().min(8, 'Password must be minimum 8 characters').max(32, 'Password cannot exceed 32 characters').required()
    .test(
      'not-same-password',
      'New password must be different from old password',
      function (value) {
        return value !== this.parent.oldPassword;
      }
    ),
  confirmPassword: yup.string()
    .max(32, 'Confirm password too long')
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

export const  changeEmailSchema=yup.object({
   oldEmail:yup.string().email().required('old email  is required'),
   newEmail:yup.string().email().required('new email is required'),
   password:yup.string().min(8,'password contain minimum 8 charactors').required('password is required')
})

export interface ChangeEmaiLResponseDTO{
  email:string,
  expiresAt:Date
}

export const changeEmailVerificationSchema=yup.object({
  email:yup.string().email().required('Email is required'),
  otp:yup.string()
})
export type ProfileDetailChangeFormData = yup.InferType<typeof profileDetailChangeSchema>;
export type changePasswordDTO = yup.InferType<typeof changePasswordSchema>
export type changeEmailDTO=yup.InferType<typeof changeEmailSchema>
export type changeEmailVerificationDTO=yup.InferType<typeof changeEmailVerificationSchema>