import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler, type Resolver } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import { AuctionHouseCategory } from "../../types/auctionHouse.type";
import type { TAuctionHouseCategory } from "../../types/auctionHouse.type";
import auctionHouseService from "../../services/auctionHouse.service";
import * as yup from 'yup';
import toast from 'react-hot-toast';
import {
    Building2,
    MapPin,
    FileCheck,
    AlertCircle,
    ArrowLeft,
    Loader2,
    X,
    FileText,
    UploadCloud,
    CheckCircle2,
    PhoneCall,
    RefreshCw
} from "lucide-react";

import { useAppDispatch } from "../../hooks/redux.hooks";
import { submitVerification } from "../../redux/tenant/auctionHouse.slice";
import uploadservice from "../../services/uploadservice";
import type { AdminAuctionHouseDetailDTO, AuctionHouseSubmissionDTO } from "../../types/auctionHouse.type";

const resubmissionSchema = yup.object({
    name: yup.string().trim().min(3, 'Name must be at least 3 characters').max(100, 'Name cannot exceed 100 characters').required('Required'),
    yearEstablished: yup.number().typeError('Must be a year').required().min(1700).max(new Date().getFullYear()),
    briefDescription: yup.string().min(20, 'Min 20 characters').max(1000, 'Description cannot exceed 1000 characters').required(),
    categories: yup
        .array()
        .of(yup.string().oneOf(Object.values(AuctionHouseCategory)).required())
        .min(1, 'Please select at least one operational category specialty')
        .required('Category specialty is required'),
    address: yup.object({
        city: yup.string().trim().min(2,'City must be atleat 2 characters').max(50, 'City too long').required('Required'),
        state: yup.string().trim().min(2,'State must be atleat 2 characters').max(50, 'State too long').required('Required'),
        country: yup.string().trim().min(2,'Country must be atleat 2 characters').max(50, 'Country too long').required('Required'),
        fullAddress: yup.string().min(5, 'Address too short').max(255, 'Address too long').required()
    }),
    contact: yup.object({
        primaryContactName: yup.string().trim().min(3, 'Name must be at least 3 characters').max(100, 'Name too long').required('Required'),
        businessEmail: yup.string().email('Invalid email').max(100, 'Email too long').required(),
        phone: yup.string().matches(/^\d{10}$/, 'Phone must be exactly 10 digits').max(10, 'Phone cannot exceed 10 digits').required(),
    }),
    legal: yup.object({
        registrationNumber: yup.string().trim().min(6,'Registration Number atleast 6 charactor').max(100, 'Registration number too long').required('Required'),
        taxId: yup.string().trim().min(6,'TaxID atleast 6 charactor').max(50, 'Tax ID too long').required('Required'),
    }),
    registrationCertificate: yup.mixed<File>().nullable().test("is-image", "Only image files (JPEG, PNG, WEBP) are allowed", (value) => {
        if (!value || !(value instanceof File)) return true;
        return value.type.startsWith("image/");
    }),
    identityProof: yup.mixed<File>().nullable().test("is-image", "Only image files (JPEG, PNG, WEBP) are allowed", (value) => {
        if (!value || !(value instanceof File)) return true; // Pass if no new file is chosen
        return value.type.startsWith("image/");
    }),
}).required();

type ResubmitFormData = yup.InferType<typeof resubmissionSchema>;

const TenantVerificationResubmissionPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [profile, setProfile] = useState<AdminAuctionHouseDetailDTO | null>(null)
    const [loading, setLoading] = useState(false)
    const [regCertPreview, setRegCertPreview] = useState<string | null>(null);
    const [idProofPreview, setIdProofReview] = useState<string | null>(null);

    const status = profile?.status;

    const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<ResubmitFormData>({
        resolver: yupResolver(resubmissionSchema) as Resolver<ResubmitFormData>,
        defaultValues: {
            name: '',
            briefDescription: "",
            categories: [],
            address: { city: '', state: '', country: '', fullAddress: '' },
            contact: { primaryContactName: '', businessEmail: '', phone: '' },
            legal: { registrationNumber: '', taxId: '' }

        }
    });

    const regCertFile = watch('registrationCertificate');
    const idProofFile = watch('identityProof');
    const selectedCategories = watch('categories') || [];
    useEffect(() => {
        if (regCertFile instanceof File) {
            const objectUrl = URL.createObjectURL(regCertFile)
            setRegCertPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl)
        } else {
            setRegCertPreview(null)
        }
    }, [regCertFile])
    useEffect(() => {
        if (idProofFile instanceof File) {
            const objectUrl = URL.createObjectURL(idProofFile);
            setIdProofReview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl)
        }
        else {
            setIdProofReview(null)
        }
    }, [idProofFile])

    const fetchAuctionHouseData = async () => {
        setLoading(true)
        const response = await auctionHouseService.getProfile()
        if (response.success && response.data) {
            setProfile(response.data)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchAuctionHouseData()
    }, [dispatch]);

    useEffect(() => {

        if (profile) {
            reset({
                name: profile.businessName ?? '',
                yearEstablished: profile.yearEstablished ?? 0,
                briefDescription: profile.briefDescription ?? '',
                categories: (profile.category as TAuctionHouseCategory[]) ?? [],
                address: profile.address ?? { city: '', state: '', country: '', fullAddress: '' },
                contact: profile.contact ?? { primaryContactName: '', businessEmail: '', phone: '' },
                legal: {
                    registrationNumber: profile.documents?.registerNumber,
                    taxId: profile.documents?.taxId
                }
            });
        }
    }, [profile, reset]);

    const handleCategoryToggle = (category: TAuctionHouseCategory) => {
        const current = [...selectedCategories];
        const index = current.indexOf(category);
        if (index > -1) {
            current.splice(index, 1)
        } else {
            current.push(category)
        }
        setValue('categories', current, { shouldValidate: true })
    }

    const onSubmit: SubmitHandler<ResubmitFormData> = async (data) => {
        try {
            let regCertUrl = profile?.documents?.registrationCertificateUrl || '';
            let idProofUrl = profile?.documents?.identityProofUrl || '';

            if (data.registrationCertificate instanceof File) {
                regCertUrl = await uploadservice.uploadSecurely(data.registrationCertificate);
            }
            if (data.identityProof instanceof File) {
                idProofUrl = await uploadservice.uploadSecurely(data.identityProof);
            }

            const finalPayload: AuctionHouseSubmissionDTO = {
                ...data,


                legal: {
                    registrationNumber: data.legal.registrationNumber,
                    taxId: data.legal.taxId,
                    registrationCertificateUrl: regCertUrl,
                    identityProofUrl: idProofUrl
                }
            };

            await dispatch(submitVerification(finalPayload)).unwrap();
            toast.success('Application updated successfully');
            navigate('/tenant/dashboard');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Submission failed";
            toast.error(errorMessage);
        }
    };

    const cardStyle = "bg-[#FFFFFF] rounded-2xl p-8 border border-[#E2E8F0] shadow-sm mb-6";
    const inputStyle = "w-full bg-[#FFFFFF] border border-[#E2E8F0] px-4 py-3 rounded-xl text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#2F6FED]/10 focus:border-[#2F6FED] transition-all placeholder:text-[#94A3B8]";
    const labelStyle = "block text-[11px] font-bold uppercase tracking-wider text-[#475569] mb-2";
    const errorStyle = "text-[#F87171] text-[10px] font-medium mt-1";

    if (loading && !profile) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#F5F7FB]">
                <Loader2 className="animate-spin text-[#2F6FED]" size={32} />
            </div>
        );
    }

    const DocumentPreview = ({
        label,
        currentUrl,
        localPreviewUrl,
        selectedFile,
        onFileSelect,
        onClearFile
    }: {
        label: string,
        currentUrl?: string,
        localPreviewUrl: string | null,
        selectedFile?: File | null,
        onFileSelect: (file: File) => void,
        onClearFile: () => void
    }) => {
        const displayUrl = localPreviewUrl || currentUrl;
        const isImage = displayUrl?.match(/\.(jpeg|jpg|gif|png|webp)$/i) || localPreviewUrl;

        return (
            <div className="space-y-2">
                <label className={labelStyle}>{label}</label>
                <div className="relative border-2 border-dashed border-[#E2E8F0] rounded-2xl p-4 bg-[#FFFFFF] transition-all">

                    {selectedFile ? (
                        <div className="flex items-center justify-between bg-[#F0FDF4] p-3 rounded-xl border border-[#DCFCE7]">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                {isImage ? (
                                    <div className="w-10 h-10 rounded-lg bg-white overflow-hidden border border-[#E2E8F0] flex-shrink-0">
                                        <img src={displayUrl!} alt="Local Preview" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <CheckCircle2 size={18} className="text-[#22C55E] flex-shrink-0" />
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-[#166534] truncate">{selectedFile.name}</p>
                                    <p className="text-[10px] text-[#22C55E] font-medium">Ready to upload</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClearFile}
                                className="p-1.5 hover:bg-[#DCFCE7] rounded-md text-[#166534] transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : currentUrl ? (
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                                <div className="w-16 h-16 rounded-lg bg-[#F5F7FB] overflow-hidden border border-[#E2E8F0] flex-shrink-0">
                                    {isImage ? (
                                        <img src={currentUrl} alt="Server Record" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[#2F6FED]"><FileText size={24} /></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-[#2F6FED] uppercase tracking-tighter mb-1">Current File Attached</p>
                                    <p className="text-xs text-[#475569] truncate font-medium">Click change option to switch document</p>
                                </div>
                            </div>

                            <label className="flex items-center gap-1.5 bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-xl text-xs font-bold text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] cursor-pointer shadow-sm transition-all flex-shrink-0">
                                <RefreshCw size={12} />
                                <span>Change</span>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                    onChange={(event) => {
                                        if (event.target.files && event.target.files[0]) {
                                            onFileSelect(event.target.files[0]);
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    ) : (

                        <label className="py-4 flex flex-col items-center gap-2 cursor-pointer group hover:bg-[#F5F7FB] rounded-xl transition-all w-full">
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                onChange={(event) => {
                                    if (event.target.files && event.target.files[0]) {
                                        onFileSelect(event.target.files[0]);
                                    }
                                }}
                            />
                            <UploadCloud size={24} className="text-[#94A3B8] group-hover:text-[#2F6FED] transition-colors" />
                            <span className="text-[11px] font-bold text-[#475569] uppercase group-hover:text-[#0F172A] transition-colors">Upload Document</span>
                        </label>
                    )}
                </div>

            </div>
        );
    };
    return (
        <div className="min-h-screen bg-[#F5F7FB] pt-12 pb-24 px-6">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 mb-8 text-[#475569] hover:text-[#0F172A] transition-colors font-bold text-[11px] uppercase tracking-widest"
                >
                    <ArrowLeft size={14} /> Back to Dashboard
                </button>

                <div className="mb-10">
                    <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">House Verification</h1>
                    <p className="text-[#475569] mt-2 text-sm font-medium">Update your business details to resume operations.</p>
                </div>

                {status === 'rejected' && (
                    <div className="mb-8 bg-[#FEF2F2] border border-[#FEE2E2] p-5 rounded-2xl flex items-start gap-4">
                        <AlertCircle className="text-[#EF4444] mt-0.5" size={20} />
                        <div>
                            <h3 className="text-[10px] font-black uppercase text-[#991B1B] tracking-widest">Rejection Reason</h3>
                            <p className="text-sm text-[#B91C1C] mt-1 font-medium">{profile?.rejectionReason || "Document mismatch."}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className={cardStyle}>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-[#F5F7FB] rounded-xl flex items-center justify-center text-[#2F6FED]">
                                <Building2 size={20} />
                            </div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-[#0F172A]">Identity Details</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className={labelStyle}>Business Name</label>
                                <input {...register('name')} className={inputStyle} />
                                {errors.name && <p className={errorStyle}>{errors.name.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className={labelStyle}>Established Year</label>
                                <input type="number" {...register('yearEstablished')} className={inputStyle} />
                                {errors.yearEstablished && <p className={errorStyle}>{errors.yearEstablished.message}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelStyle}>Brief Bio</label>
                                <textarea rows={3} {...register('briefDescription')} className={`${inputStyle} resize-none`} />
                                {errors.briefDescription && <p className={errorStyle}>{errors.briefDescription.message}</p>}
                            </div>
                        </div>
                    </div>
                    <div className={cardStyle}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-[#F5F7FB] rounded-xl flex items-center justify-center text-[#2F6FED]">
                                <CheckCircle2 size={20} />
                            </div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-[#0F172A]">Operational Specialties</h2>
                        </div>
                        <p className="text-xs text-[#64748B] mb-4 font-medium">Select all vertical specialties handled inside your local lot yards.</p>

                        <div className="flex flex-wrap gap-2">
                            {Object.values(AuctionHouseCategory).map((cat) => {
                                const isSelected = selectedCategories.includes(cat);
                                return (
                                    <button
                                        type="button"
                                        key={cat}
                                        onClick={() => handleCategoryToggle(cat)}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${isSelected
                                            ? "bg-[#0F172A] border-[#0F172A] text-[#FFFFFF]"
                                            : "bg-[#FFFFFF] border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]"
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                        {errors.categories && <p className={errorStyle}>{errors.categories.message}</p>}
                    </div>

                    <div className={cardStyle}>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-[#F5F7FB] rounded-xl flex items-center justify-center text-[#2F6FED]">
                                <PhoneCall size={20} />
                            </div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-[#0F172A]">Corporate Contacts</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className={labelStyle}>Contact Rep Name</label>
                                <input {...register('contact.primaryContactName')} placeholder="John Doe" className={inputStyle} />
                                {errors.contact?.primaryContactName && <p className={errorStyle}>{errors.contact.primaryContactName.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className={labelStyle}>Business Email Address</label>
                                <input {...register('contact.businessEmail')} placeholder="corp@domain.com" className={inputStyle} />
                                {errors.contact?.businessEmail && <p className={errorStyle}>{errors.contact.businessEmail.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className={labelStyle}>Official Direct Line</label>
                                <input {...register('contact.phone')} placeholder="10-digit number" className={inputStyle} />
                                {errors.contact?.phone && <p className={errorStyle}>{errors.contact.phone.message}</p>}
                            </div>
                        </div>
                    </div>
                    <div className={cardStyle}>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-[#F5F7FB] rounded-xl flex items-center justify-center text-[#2F6FED]">
                                <MapPin size={20} />
                            </div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-[#0F172A]">Business Location</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <input {...register('address.city')} placeholder="City" className={inputStyle} />
                            {errors.address?.city && <p className={errorStyle}>{errors.address.city.message}</p>}
                            <input {...register('address.state')} placeholder="State" className={inputStyle} />
                            {errors.address?.state && <p className={errorStyle}>{errors.address.state.message}</p>}
                            <input {...register('address.country')} placeholder="Country" className={inputStyle} />
                            {errors.address?.country && <p className={errorStyle}>{errors.address.country.message}</p>}
                        </div>
                        <input {...register('address.fullAddress')} placeholder="Street Address" className={inputStyle} />
                        {errors.address?.fullAddress && <p className={errorStyle}>{errors.address.fullAddress.message}</p>}
                    </div>

                    <div className={cardStyle}>
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[#F1F5F9]">
                            <FileCheck size={20} className="text-[#2F6FED]" />
                            <h2 className="text-sm font-black uppercase tracking-widest text-[#0F172A]">Compliance Documents</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <label className={labelStyle}>Registration No.</label>
                                    <input {...register('legal.registrationNumber')} className={inputStyle} />
                                    {errors.legal?.registrationNumber && <p className={errorStyle}>{errors.legal.registrationNumber.message}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className={labelStyle}>Tax Identifier (TIN/VAT)</label>
                                    <input {...register('legal.taxId')} className={inputStyle} />
                                    {errors.legal?.taxId && <p className={errorStyle}>{errors.legal.taxId.message}</p>}

                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-4">
                                    <DocumentPreview
                                        label="Business Certificate"
                                        currentUrl={profile?.documents?.registrationCertificateUrl}
                                        selectedFile={regCertFile}
                                        localPreviewUrl={regCertPreview}
                                        onFileSelect={(file) => setValue('registrationCertificate', file, { shouldValidate: true })}
                                        onClearFile={() => setValue('registrationCertificate', null, { shouldValidate: true })}
                                    />
                                    {errors.registrationCertificate && (
                                        <p className={errorStyle}>{errors.registrationCertificate.message}</p>
                                    )}
                                    <DocumentPreview

                                        label="Owner Identity Proof"
                                        currentUrl={profile?.documents?.identityProofUrl}
                                        selectedFile={idProofFile}
                                        localPreviewUrl={idProofPreview}
                                        onFileSelect={(file) => setValue('identityProof', file, { shouldValidate: true })}
                                        onClearFile={() => setValue('identityProof', null, { shouldValidate: true })}

                                    />
                                    {errors.identityProof && (
                                        <p className={errorStyle}>{errors.identityProof.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#2F6FED] text-white py-4 rounded-xl font-bold text-sm uppercase tracking-[0.1em] hover:bg-[#2557C8] transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-[#2F6FED]/20"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Update Verification Details"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TenantVerificationResubmissionPage;