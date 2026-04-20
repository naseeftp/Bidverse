import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler, type Resolver } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
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
    CheckCircle2
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../hooks/redux.hooks";
import { fetchAuctionProfile, submitVerification } from "../../redux/tenant/auctionHouse.slice";
import uploadservice from "../../services/uploadservice";
import type { AuctionHouseSubmissionDTO } from "../../types/auctionHouse.type";

const resubmissionSchema = yup.object({
    name: yup.string().min(3, 'Name must be at least 3 characters').required('Required'),
    yearEstablished: yup.number().typeError('Must be a year').required().min(1700).max(new Date().getFullYear()),
    briefDescription: yup.string().min(20, 'Min 20 characters').required(),
    address: yup.object({
        city: yup.string().required('Required'),
        state: yup.string().required('Required'),
        country: yup.string().required('Required'),
        fullAddress: yup.string().min(5, 'Address too short').required()
    }),
    contact: yup.object({
        primaryContactName: yup.string().required('Required'),
        businessEmail: yup.string().email('Invalid email').required(),
        phone: yup.string().min(10, 'Min 10 digits').required(),
    }),
    legal: yup.object({
        registrationNumber: yup.string().required('Required'),
        taxId: yup.string().required('Required'),
    }),
    registrationCertificate: yup.mixed<File>().nullable().optional(),
    identityProof: yup.mixed<File>().nullable().optional(),
}).required();

type ResubmitFormData = yup.InferType<typeof resubmissionSchema>;

const TenantVerificationResubmissionPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { profile, status, loading, reason } = useAppSelector((state) => state.auctionHouse);

    const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<ResubmitFormData>({
        resolver: yupResolver(resubmissionSchema) as Resolver<ResubmitFormData>,
        defaultValues: {
            name: '',
            address: { city: '', state: '', country: '', fullAddress: '' },
            contact: { primaryContactName: '', businessEmail: '', phone: '' },
            legal: { registrationNumber: '', taxId: '' }
        }
    });

    const regCertFile = watch('registrationCertificate');
    const idProofFile = watch('identityProof');

    useEffect(() => {
        dispatch(fetchAuctionProfile());
    }, [dispatch]);

    useEffect(() => {
        if (profile) {
            reset({
                name: profile.name,
                yearEstablished: profile.yearEstablished,
                briefDescription: profile.briefDescription,
                address: profile.address,
                contact: profile.contact,
                legal: {
                    registrationNumber: profile.documents.registerNumber,
                    taxId: profile.documents.taxId
                }
            });
        }
    }, [profile, reset]);

    const onSubmit: SubmitHandler<ResubmitFormData> = async (data) => {
        try {
            let regCertUrl = profile?.documents.registrationCertificateUrl || '';
            let idProofUrl = profile?.documents.identityProofUrl || '';

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

    const DocumentPreview = ({ label, currentUrl, selectedFile, onClear }: { 
        label: string, 
        currentUrl?: string, 
        selectedFile?: File | null, 
        onClear: (file: File) => void // eslint-disable-line no-unused-vars
    }) => (
        <div className="space-y-2">
            <label className={labelStyle}>{label}</label>
            <div className="relative group border-2 border-dashed border-[#E2E8F0] rounded-2xl p-4 bg-[#FFFFFF] hover:bg-[#F5F7FB] transition-all">
                {selectedFile ? (
                    <div className="flex items-center justify-between bg-[#F0FDF4] p-3 rounded-xl border border-[#DCFCE7]">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 size={18} className="text-[#22C55E]" />
                            <span className="text-xs font-semibold text-[#166534] truncate max-w-[150px]">{selectedFile.name}</span>
                        </div>
                        <button type="button" className="p-1 hover:bg-[#DCFCE7] rounded-md text-[#166534]"><X size={14} /></button>
                    </div>
                ) : currentUrl ? (
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg bg-[#F5F7FB] overflow-hidden border border-[#E2E8F0] flex-shrink-0">
                            {currentUrl.match(/\.(jpeg|jpg|gif|png)$/) ? (
                                <img src={currentUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#2F6FED]"><FileText size={24} /></div>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-bold text-[#2F6FED] uppercase tracking-tighter mb-1">Current File Attached</p>
                            <input 
                                type="file" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                onChange={(event) => {
                                    if (event.target.files && event.target.files[0]) {
                                        onClear(event.target.files[0]); 
                                    }
                                }}
                            />
                            <p className="text-[11px] text-[#475569]">Click to replace with new file</p>
                        </div>
                    </div>
                ) : (
                    <div className="py-4 flex flex-col items-center gap-2">
                        <UploadCloud size={24} className="text-[#94A3B8]" />
                        <span className="text-[11px] font-bold text-[#475569] uppercase">Upload Document</span>
                        <input 
                            type="file" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                            onChange={(event) => {
                                if (event.target.files && event.target.files[0]) {
                                    onClear(event.target.files[0]); 
                                }
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );

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
                            <p className="text-sm text-[#B91C1C] mt-1 font-medium">{reason || "Document mismatch."}</p>
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
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-[#F5F7FB] rounded-xl flex items-center justify-center text-[#2F6FED]">
                                <MapPin size={20} />
                            </div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-[#0F172A]">Business Location</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <input {...register('address.city')} placeholder="City" className={inputStyle} />
                            <input {...register('address.state')} placeholder="State" className={inputStyle} />
                            <input {...register('address.country')} placeholder="Country" className={inputStyle} />
                        </div>
                        <input {...register('address.fullAddress')} placeholder="Street Address" className={inputStyle} />
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
                                </div>
                                <div className="space-y-1">
                                    <label className={labelStyle}>Tax Identifier (TIN/VAT)</label>
                                    <input {...register('legal.taxId')} className={inputStyle} />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-4">
                                    <DocumentPreview 
                                        label="Business Certificate"
                                        currentUrl={profile?.documents.registrationCertificateUrl}
                                        selectedFile={regCertFile}
                                        onClear={(file) => setValue('registrationCertificate', file)}
                                    />
                                    <DocumentPreview 
                                        label="Owner Identity Proof"
                                        currentUrl={profile?.documents.identityProofUrl}
                                        selectedFile={idProofFile}
                                        onClear={(file) => setValue('identityProof', file)}
                                    />
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