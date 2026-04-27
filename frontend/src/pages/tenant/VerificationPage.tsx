import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { 
  Building2, MapPin, PhoneCall, FileCheck, Info, Loader2 
} from 'lucide-react';

import { useAppDispatch } from "../../hooks/redux.hooks";
import { submitVerification } from '../../redux/tenant/auctionHouse.slice';
import uploadservice from '../../services/uploadservice';
import type { AuctionHouseSubmissionDTO } from '../../types/auctionHouse.type';

const schema = yup.object({
  name: yup
    .string()
    .trim()
    .max(100, 'Business name cannot exceed 100 characters') 
    .required('Business name is required'),

  yearEstablished: yup
    .number()
    .typeError('Must be a year')
    .required('Year is required')
    .min(1800, 'Year is too old')
    .max(new Date().getFullYear(), 'Year cannot be in the future'),

  briefDescription: yup
    .string()
    .min(20, 'Please provide more detail')
    .max(1000, 'Description cannot exceed 1000 characters') 
    .required('Description is required'),

  address: yup.object({
    city: yup
      .string()
      .max(50, 'City too long') 
      .required('City is required'),

    state: yup
      .string()
      .max(50, 'State too long') 
      .required('State is required'),

    country: yup
      .string()
      .max(50, 'Country too long') 
      .required('Country is required'),

    fullAddress: yup
      .string()
      .max(255, 'Address too long') 
      .required('Full address is required'),
  }),

  contact: yup.object({
    primaryContactName: yup
      .string()
      .max(100, 'Name too long') 
      .required('Contact name is required'),

    businessEmail: yup
      .string()
      .email('Invalid email')
      .max(100, 'Email too long') 
      .required('Email is required'),

    phone: yup
      .string()
      .matches(/^\d{10}$/, 'Phone must be exactly 10 digits') 
      .max(10, 'Phone cannot exceed 10 digits') 
      .required('Phone is required'),
  }),

  legal: yup.object({
    registrationNumber: yup
      .string()
      .max(100, 'Registration number too long') 
      .required('Reg. number is required'),

    taxId: yup
      .string()
      .max(50, 'Tax ID too long') 
      .required('Tax ID is required'),
  }),

  registrationCertificate: yup
    .mixed<File>()
    .required('Certificate is required'),

  identityProof: yup
    .mixed<File>()
    .required('ID proof is required'),
}).required();

type VerificationFormData = yup.InferType<typeof schema>;

const TenantVerificationForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<VerificationFormData>({
    resolver: yupResolver(schema),
  });

  const regCertFile = watch('registrationCertificate') as File | undefined;
  const idProofFile = watch('identityProof') as File | undefined;

  
  const onSubmit = async (data: VerificationFormData) => {
    try {
      const [regCertUrl, idProofUrl] = await Promise.all([
        uploadservice.uploadSecurely(data.registrationCertificate as File),
        uploadservice.uploadSecurely(data.identityProof as File)
      ]);

      const finalPayload: AuctionHouseSubmissionDTO = {
        name: data.name,
        yearEstablished: data.yearEstablished,
        briefDescription: data.briefDescription,
        address: data.address,
        contact: data.contact,
        legal: {
          registrationNumber: data.legal.registrationNumber,
          taxId: data.legal.taxId,
          registrationCertificateUrl: regCertUrl, 
          identityProofUrl: idProofUrl,           
        },
      };

      
      await dispatch(submitVerification(finalPayload)).unwrap();
      
      toast.success('Verification submitted successfully');
      navigate('/tenant/dashboard');

    } catch (error: unknown) {
      let errorMessage = "Submission failed. Please try again.";
      
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      toast.error(errorMessage);
    }
  };

  const inputStyle = "w-full bg-[#FFFFFF] border border-[#E2E8F0] px-4 py-3 rounded-xl text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#2F6FED]/20 focus:border-[#2F6FED] transition-all placeholder:text-[#94A3B8]";
  const labelStyle = "block text-[10px] font-bold uppercase tracking-widest text-[#475569] mb-1";
  const errorStyle = "text-[#EF4444] text-[9px] font-bold uppercase mt-1";

  return (
    <div className="max-w-4xl mx-auto pb-20 px-6 pt-10 font-sans">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Auction House Verification</h1>
        <p className="text-[#475569] mt-2 text-[11px] font-medium uppercase tracking-wider">Complete your profile to start hosting auctions</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
      
        <div className="bg-white rounded-2xl p-8 border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[#F5F7FB]">
            <Building2 size={18} className="text-[#2F6FED]" />
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-[#0F172A]">Business Identity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className={labelStyle}>Auction House Name</label>
              <input {...register('name')} placeholder="Legal Name" className={inputStyle} />
              {errors.name && <p className={errorStyle}>{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <label className={labelStyle}>Year Established</label>
              <input type="number" {...register('yearEstablished')} placeholder="YYYY" className={inputStyle} />
              {errors.yearEstablished && <p className={errorStyle}>{errors.yearEstablished.message}</p>}
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className={labelStyle}>Brief Description</label>
              <textarea rows={3} {...register('briefDescription')} placeholder="Specialization..." className={`${inputStyle} resize-none`} />
              {errors.briefDescription && <p className={errorStyle}>{errors.briefDescription.message}</p>}
            </div>
          </div>
        </div>

        {/* Location & Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <MapPin size={18} className="text-[#2F6FED]" />
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#0F172A]">Location</h2>
            </div>
            <div className="space-y-4">
              <div>
                <input {...register('address.city')} placeholder="City" className={inputStyle} />
                {errors.address?.city && <p className={errorStyle}>{errors.address.city.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input {...register('address.state')} placeholder="State" className={inputStyle} />
                  {errors.address?.state && <p className={errorStyle}>{errors.address.state.message}</p>}
                </div>
                <div>
                  <input {...register('address.country')} placeholder="Country" className={inputStyle} />
                  {errors.address?.country && <p className={errorStyle}>{errors.address.country.message}</p>}
                </div>
              </div>
              <div>
                <input {...register('address.fullAddress')} placeholder="Street Address" className={inputStyle} />
                {errors.address?.fullAddress && <p className={errorStyle}>{errors.address.fullAddress.message}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <PhoneCall size={18} className="text-[#2F6FED]" />
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#0F172A]">Contact</h2>
            </div>
            <div className="space-y-4">
              <div>
                <input {...register('contact.primaryContactName')} placeholder="Primary Name" className={inputStyle} />
                {errors.contact?.primaryContactName && <p className={errorStyle}>{errors.contact.primaryContactName.message}</p>}
              </div>
              <div>
                <input {...register('contact.businessEmail')} placeholder="Email" className={inputStyle} />
                {errors.contact?.businessEmail && <p className={errorStyle}>{errors.contact.businessEmail.message}</p>}
              </div>
              <div>
                <input {...register('contact.phone')} placeholder="Phone" className={inputStyle} />
                {errors.contact?.phone && <p className={errorStyle}>{errors.contact.phone.message}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Legal */}
        <div className="bg-white rounded-2xl p-8 border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <FileCheck size={18} className="text-[#2F6FED]" />
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-[#0F172A]">Legal Documents</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className={labelStyle}>Registration Number</label>
                <input {...register('legal.registrationNumber')} className={inputStyle} />
                {errors.legal?.registrationNumber && <p className={errorStyle}>{errors.legal.registrationNumber.message}</p>}
              </div>
              <div>
                <label className={labelStyle}>Tax ID</label>
                <input {...register('legal.taxId')} className={inputStyle} />
                {errors.legal?.taxId && <p className={errorStyle}>{errors.legal.taxId.message}</p>}
              </div>
            </div>

            <div className="space-y-4">
               <div>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setValue('registrationCertificate', file, { shouldValidate: true });
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                  <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${regCertFile ? 'border-[#10B981] bg-[#F0FDF4]' : 'border-[#E2E8F0] hover:border-[#2F6FED]'}`}>
                    <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest truncate">
                      {regCertFile ? regCertFile.name : 'Upload Registration Cert'}
                    </p>
                  </div>
                </div>
                {errors.registrationCertificate && <p className={errorStyle}>{errors.registrationCertificate.message as string}</p>}
              </div>

              <div>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setValue('identityProof', file, { shouldValidate: true });
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                  <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${idProofFile ? 'border-[#10B981] bg-[#F0FDF4]' : 'border-[#E2E8F0] hover:border-[#2F6FED]'}`}>
                    <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest truncate">
                      {idProofFile ? idProofFile.name : 'Upload ID Proof'}
                    </p>
                  </div>
                </div>
                {errors.identityProof && <p className={errorStyle}>{errors.identityProof.message as string}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 mt-12">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full md:w-auto bg-[#2F6FED] text-white px-16 py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#2557C8] transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Uploading...</span>
              </>
            ) : "Submit for Verification"}
          </button>
          <div className="flex items-center gap-2 text-[#94A3B8]">
            <Info size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Typical approval time: 24-48 Hours</span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TenantVerificationForm;