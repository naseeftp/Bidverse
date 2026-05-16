import React, { useState, useEffect, useRef } from "react";
import profileService from '../../services/profileManagement.service';
import uploadservice from "../../services/uploadservice";
import type { UserResponseDTO } from "../../types/auth.type";
import { Mail, Lock, User as UserIcon, Trash2, Camera, Check, Pencil, AlertTriangle, X } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const ProfilePage: React.FC = () => {
    const [user, setUser] = useState<UserResponseDTO | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: "", phone: "" });
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    useEffect(() => {
        const fetchData = async () => {
            const response = await profileService.getProfile();
            if (response.success && response.data) {
                setUser(response.data);
                setFormData({ name: response.data.name, phone: response.data.phone });
            }
        };
        fetchData();
    }, []);
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if(!file.type.startsWith('image/')){
            toast.error("Please select a valid image file (PNG, JPEG, etc)")
            if(fileInputRef.current) fileInputRef.current.value=''
            return
        }
        setIsUploading(true);
        try {
            const secureUrl = await uploadservice.uploadSecurely(file);
            const response = await profileService.updateProfileImage({ profileImage: secureUrl })
            if (response.success && response.data) {
                setUser(response.data);
                toast.success(response.message)
            } else {
                toast.error(response.message)
            }

        } catch {
            toast.error("An error occurred during upload.")
        }
        finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }
    const handleProfileImgDelete = async () => {
        setIsDeleteModalOpen(false)
        setIsUploading(true);

        try {
            const response = await profileService.updateProfileImage({ profileImage: null })
            if (response.success && response.data) {
                setUser(response.data)
                toast.success(response.message)
            }
            else {
                toast.error(response.message)
            }


        } catch {
            toast.error('Error while removing profile image')
        }
        finally {
            setIsUploading(false)
            
        }
    }

    const handleSave = async () => {
        const isChanged = user?.name !== formData.name || user.phone != formData.phone;
        if (!isChanged) {
            setIsEditing(false);
            toast.error('No changes Made')
            return
        }
        try {
            const response = await profileService.changeProfileDetails(formData);
            if (response.success && response.data) {
                setIsEditing(false);
                setUser({ ...user!, ...formData });
                toast.success(response.message)

            }
            else {
                toast.error(response.message)
            }
        } catch (error) {
            toast.error('Unexpected Error in Updating Details', error!)
        }

    };

    return (
        <div className="min-h-screen bg-[#FFF9F4] text-[#1F1F1F] font-sans selection:bg-[#C9653B] selection:text-white">
            <div className="max-w-4xl mx-auto py-12 px-6">


                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                        <p className="text-[#6B6B6B] text-sm mt-1">Manage your personal information and security preferences.</p>
                    </div>
                    {user?.provider == 'local' &&
                        <div className="flex gap-3">
                            <Link to='/change-password'>
                                <button className="px-4 py-2 bg-white border border-[#E6E0DA] rounded-lg text-sm font-semibold hover:bg-[#FFF9F4] transition-colors flex items-center gap-2">
                                    <Lock size={16} /> Change Password
                                </button>
                            </Link>
                            <Link to='/change-email'>
                                <button className="px-4 py-2 bg-[#C9653B] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm">
                                    <Mail size={16} /> Change Email
                                </button>
                            </Link>
                        </div>
                    }

                </div>

                <div className="space-y-6">
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />

                    <section className="bg-white rounded-xl border border-[#E6E0DA] p-8 shadow-sm">
                        <div className="flex flex-col sm:flex-row items-center gap-8">
                            <div className="relative group">
                                <div className="w-28 h-28 rounded-full bg-[#FFF9F4] border border-[#E6E0DA] flex items-center justify-center overflow-hidden">
                                    {user?.profileImage ? (
                                        <img src={user.profileImage} alt="User" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon size={40} className="text-[#6B6B6B]" />
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <h3 className="text-lg font-bold">Profile Picture</h3>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        disabled={isUploading}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-1.5 bg-[#C9653B] text-white text-xs font-bold rounded-md flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        <Camera size={14} />
                                        {user?.profileImage ? 'Change Photo' : 'Add Profile Pic'}
                                    </button>
                                    {user?.profileImage && !isUploading && (
                                        <button
                                            type="button"
                                            onClick={() => setIsDeleteModalOpen(true)}
                                            className="px-4 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-md hover:bg-red-100 transition-colors flex items-center gap-1.5"
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="bg-white rounded-xl border border-[#E6E0DA] shadow-sm overflow-hidden">
                        <div className="px-8 py-5 border-b border-[#E6E0DA] flex justify-between items-center bg-white">
                            <h3 className="font-bold">Personal Information</h3>
                            <button
                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                className="px-3 py-1 text-xs font-bold bg-[#FFF9F4] border border-[#E6E0DA] rounded text-[#C9653B] hover:bg-[#C9653B] hover:text-white transition-all flex items-center gap-1.5"
                            >
                                {isEditing ? <><Check size={14} /> Save Changes</> : <><Pencil size={14} /> Edit Details</>}
                            </button>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-[#6B6B6B] uppercase">Full Name</label>
                                {isEditing ? (
                                    <input
                                        className="w-full border border-[#E6E0DA] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C9653B]"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-sm font-medium">{user?.name}</p>
                                )}
                            </div>


                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-[#6B6B6B] uppercase">Phone Number</label>
                                {isEditing ? (
                                    <input
                                        className="w-full border border-[#E6E0DA] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C9653B]"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-sm font-medium">{user?.phone || 'Not connected'}</p>
                                )}
                            </div>


                            <div className="space-y-2 opacity-80">
                                <label className="text-[11px] font-bold text-[#6B6B6B] uppercase">Email Address</label>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-[#6B6B6B]">{user?.email}</p>
                                </div>
                            </div>
                            <div className="space-y-2 opacity-80">
                                <label className="text-[11px] font-bold text-[#6B6B6B] uppercase">Account Role</label>
                                <p className="text-sm font-medium text-[#6B6B6B] capitalize">{user?.role}</p>
                            </div>
                        </div>
                    </section>

                    {isDeleteModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                            <div className="bg-white w-full max-w-md rounded-xl border border-[#E6E0DA] p-6 shadow-xl space-y-4 animate-scale-up">

                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-red-50 rounded-lg text-red-600">
                                        <AlertTriangle size={24} />
                                    </div>
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors p-1 rounded-md hover:bg-[#FFF9F4]"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-[#1F1F1F]">Remove Profile Picture?</h3>
                                    <p className="text-[#6B6B6B] text-sm leading-relaxed">
                                        This will permanently delete your profile photo. You can upload a new photo at any time.
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-2 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="px-4 py-2 bg-white border border-[#E6E0DA] rounded-lg text-sm font-semibold text-[#1F1F1F] hover:bg-[#FFF9F4] transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleProfileImgDelete}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm flex items-center gap-1.5"
                                    >
                                        <Trash2 size={14} /> Remove Photo
                                    </button>
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;