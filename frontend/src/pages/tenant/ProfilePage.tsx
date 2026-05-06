import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import auctionHouseService from "../../services/auctionHouse.service";
import type { AdminAuctionHouseDetailDTO } from "../../types/auctionHouse.type";
import {
    Mail, Lock, User as UserIcon, Trash2, Camera, Check,
    Pencil, Building2, ShieldCheck, MapPin, FileText, Globe
} from "lucide-react"
import profileService from '../../services/profileManagement.service';
import toast from "react-hot-toast"



const TenantProfilePage: React.FC = () => {
    const [house, setHouse] = useState<AdminAuctionHouseDetailDTO | null>(null)
    const [isEditingUser, setIsEditingUser] = useState(false);
    const [isEditingBusiness, setIsEditingBusiness] = useState(false);
    const [userData, setUserData] = useState({ name: '', phone: '' });
    const [businessData, setBusinessData] = useState({
        businessName: "",
        briefDescription: "",
        primaryContactName: "",
        businessEmail: "",
        phone: "",
        city: "",
        fullAddress: "",
    })

    useEffect(() => {
        const fethData = async () => {
            const response = await auctionHouseService.getProfile()
            if (response.success && response.data) {
                const data = response.data;
                setHouse(data);
                setUserData({ name: data.userName, phone: data.userPhone });
                setBusinessData({
                    businessName: data.businessName ?? "",
                    briefDescription: data.briefDescription ?? '',
                    primaryContactName: data.contact?.primaryContactName ?? '',
                    businessEmail: data.contact?.businessEmail ?? '',
                    phone: data.contact?.phone ?? '',
                    city: data.address?.city ?? '',
                    fullAddress: data.address?.fullAddress ?? '',


                })
            }
        }
        fethData()
    }, [])
    const handleUserSave = async () => {
        const isChanged = house?.userName !== userData.name || house.userPhone !== userData.phone
        if (!isChanged) {
            setIsEditingUser(false)
            toast.error('no changes made to account details')
            return
        }
        try {
            const response = await profileService.changeProfileDetails(userData);
            if (response.success) {
                setIsEditingUser(false);
                setHouse({
                    ...house!,
                    userName: userData.name,
                    userPhone: userData.phone
                })
                toast.success(response.message)
            }
            else {
                toast.error(response.message)
            }
        } catch {
            toast.error('Unexpected error updating account details');
        }
        
    }

    const handleBusinessSave=async ()=>{
        const isChanged=house?.businessName!=businessData.businessName
        ||house.briefDescription!=businessData.briefDescription
        ||house.contact?.primaryContactName!=businessData.primaryContactName
        ||house.contact.businessEmail!=businessData.businessEmail
        ||house.contact.phone!=businessData.phone
        ||house.address?.city!=businessData.city
        ||house.address.fullAddress!=businessData.fullAddress;

        if(!isChanged){
           setIsEditingBusiness(false)
           toast.error('No changes made to Business Details')
           return
        }
        try {
            const response=await profileService.changeBusinessDetails(businessData)
            if(response.success){
                setIsEditingBusiness(false)
                setBusinessData({
                    ...house!,
                    businessName:businessData.businessName,
                    briefDescription:businessData.briefDescription,
                    primaryContactName:businessData.primaryContactName,
                    businessEmail:businessData.businessEmail,
                    phone:businessData.phone,
                    city:businessData.city,
                    fullAddress:businessData.fullAddress
                })
                toast.success(response.message)
            }
            else{
                toast.error(response.message)
            }
        } catch{
            toast.error('failed update business Details')
        }
        
    }

    return (
        <div className="min-h-screen bg-[#F5F7FB] text-[#0F172A] pb-20">
            <div className="max-w-5xl mx-auto py-12 px-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Profile Mangement</h1>
                        <p className="text-[#475569] text-sm mt-1">Manage your personal account and business credentials.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link to='/tenant/changePassword'>
                            <button className="px-4 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm font-semibold hover:bg-[#F1F5F9] transition-colors flex items-center gap-2">
                                <Lock size={16} /> Password
                            </button>
                        </Link>
                        <Link to='/tenant/changeEmail'>
                            <button className="px-4 py-2 bg-[#2F6FED] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm">
                                <Mail size={16} /> Change Email
                            </button>
                        </Link>
                    </div>
                </div>
                <div className="space-y-8">
                    <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                        <div className="px-8 py-5 border-b border-[#F1F5F9] flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2 text-[#0F172A]"><UserIcon size={18} className="text-[#2F6FED]" /> Personal Account</h3>
                            <button
                                onClick={() => isEditingUser ? handleUserSave() : setIsEditingUser(true)}
                                className="px-3 py-1 text-xs font-bold bg-[#F8FAFC] border border-[#E2E8F0] rounded text-[#2F6FED] hover:bg-[#2F6FED] hover:text-white transition-all flex items-center gap-1.5"
                            >
                                {isEditingUser ? <><Check size={14} /> Save</> : <><Pencil size={14} /> Edit Account</>}
                            </button>
                        </div>
                        <div className="p-8 flex flex-col md:flex-row gap-10">

                            <div className="flex flex-col items-center gap-4">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center overflow-hidden">
                                        {house?.profileImage ? (
                                            <img src={house.profileImage} alt="User" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon size={32} className="text-[#94A3B8]" />
                                        )}
                                    </div>
                                    <button className="absolute bottom-0 right-0 p-1.5 bg-[#2F6FED] text-white rounded-full border-2 border-white shadow-md">
                                        <Camera size={14} />
                                    </button>
                                </div>
                                {house?.profileImage && (
                                    <button className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1">
                                        <Trash2 size={12} /> Remove
                                    </button>
                                )}
                            </div>

                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-[#64748B] uppercase">Display Name</label>
                                    <input
                                        disabled={!isEditingUser}
                                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm focus:border-[#2F6FED] outline-none disabled:opacity-60"
                                        value={userData.name}
                                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-[#64748B] uppercase">Account Phone</label>
                                    <input
                                        disabled={!isEditingUser}
                                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm focus:border-[#2F6FED] outline-none disabled:opacity-60"
                                        value={userData.phone}
                                        onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1 opacity-70">
                                    <label className="text-[11px] font-bold text-[#64748B] uppercase">Registered Email</label>
                                    <p className="text-sm font-medium pt-1">{house?.userEmail}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                        <div className="px-8 py-5 border-b border-[#F1F5F9] flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2 text-[#0F172A]"><Building2 size={18} className="text-[#2F6FED]" /> Business Identity</h3>
                            <button
                                onClick={() =>isEditingBusiness?handleBusinessSave():setIsEditingBusiness(true)}
                                className="px-3 py-1 text-xs font-bold bg-[#F8FAFC] border border-[#E2E8F0] rounded text-[#2F6FED] hover:bg-[#2F6FED] hover:text-white transition-all flex items-center gap-1.5"
                            >
                                {isEditingBusiness ? <><Check size={14} /> Save</> : <><Pencil size={14} /> Edit Business</>}
                            </button>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-[11px] font-bold text-[#64748B] uppercase">Business Name</label>
                                    <input
                                        disabled={!isEditingBusiness}
                                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm focus:border-[#2F6FED] outline-none disabled:opacity-60"
                                        value={businessData.businessName}
                                        onChange={(e) => setBusinessData({ ...businessData, businessName: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-[11px] font-bold text-[#64748B] uppercase">Public Description</label>
                                    <textarea
                                        disabled={!isEditingBusiness}
                                        rows={3}
                                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#2F6FED] disabled:opacity-60"
                                        value={businessData.briefDescription}
                                        onChange={(e) => setBusinessData({ ...businessData, briefDescription: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-[#64748B] uppercase">Contact Person</label>
                                    <input
                                        disabled={!isEditingBusiness}
                                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm focus:border-[#2F6FED] outline-none disabled:opacity-60"
                                        value={businessData.primaryContactName}
                                        onChange={(e) => setBusinessData({ ...businessData, primaryContactName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-[#64748B] uppercase">Business Phone</label>
                                    <input
                                        disabled={!isEditingBusiness}
                                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm focus:border-[#2F6FED] outline-none disabled:opacity-60"
                                        value={businessData.phone}
                                        onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-[#64748B] uppercase">Business Email</label>
                                    <input
                                        disabled={!isEditingBusiness}
                                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm focus:border-[#2F6FED] outline-none disabled:opacity-60"
                                        value={businessData.businessEmail}
                                        onChange={(e) => setBusinessData({ ...businessData, businessEmail: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-[#64748B] uppercase">City</label>
                                    <input
                                        disabled={!isEditingBusiness}
                                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm focus:border-[#2F6FED] outline-none disabled:opacity-60"
                                        value={businessData.city}
                                        onChange={(e) => setBusinessData({ ...businessData, city: e.target.value })}
                                    />
                                </div>
                                 <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-[#64748B] uppercase">FullAddress</label>
                                    <input
                                        disabled={!isEditingBusiness}
                                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm focus:border-[#2F6FED] outline-none disabled:opacity-60"
                                        value={businessData.fullAddress}
                                        onChange={(e) => setBusinessData({ ...businessData, fullAddress: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2 flex items-start gap-3 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                                    <MapPin size={18} className="text-[#2F6FED] mt-1" />
                                    <div className="flex-1 space-y-1">
                                        <label className="text-[10px] font-bold text-[#94A3B8] uppercase">Office Address</label>
                                        <p className="text-sm font-medium">{businessData.fullAddress}, {businessData.city},{house?.address?.state},{house?.address?.country}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                        <div className="px-8 py-5 border-b border-[#F1F5F9] bg-[#F8FAFC]/50 flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2 text-[#0F172A]"><FileText size={18} className="text-[#2F6FED]" /> KYC & Verification</h3>
                            {house?.isVerified && (
                                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                    <ShieldCheck size={12} /> Verified
                                </span>
                            )}
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-4 md:col-span-1">
                                <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white">
                                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase mb-3">Registration Cert</p>
                                    <a href={house?.documents?.registrationCertificateUrl} target="_blank" className="text-xs font-bold text-[#2F6FED] flex items-center gap-2 hover:underline">
                                        View Document <Globe size={14} />
                                    </a>
                                </div>
                                <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white">
                                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase mb-3">Identity Proof</p>
                                    <a href={house?.documents?.identityProofUrl} target="_blank" className="text-xs font-bold text-[#2F6FED] flex items-center gap-2 hover:underline">
                                        View Document <Globe size={14} />
                                    </a>
                                </div>
                            </div>
                            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Tax Identification</p>
                                    <p className="text-sm font-mono font-bold mt-1">{house?.documents?.taxId}</p>
                                </div>
                                <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Reg Number</p>
                                    <p className="text-sm font-mono font-bold mt-1">{house?.documents?.registerNumber}</p>
                                </div>
                                <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Est. Year</p>
                                    <p className="text-sm font-bold mt-1">{house?.yearEstablished}</p>
                                </div>
                                <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Verification Status</p>
                                    <p className="text-sm font-bold mt-1 capitalize text-[#2F6FED]">{house?.status}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

        </div>
    )
}
export default TenantProfilePage