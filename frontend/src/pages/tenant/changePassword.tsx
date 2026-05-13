import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FaEye, FaEyeSlash} from "react-icons/fa";
import { changePasswordSchema } from "../../types/profile.dto";
import type { changePasswordDTO } from "../../types/profile.dto";
import profileService from '../../services/profileManagement.service'
import toast from "react-hot-toast";

const TenantChangePasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<changePasswordDTO>({
        resolver: yupResolver(changePasswordSchema),
    });

    const onSubmit = async (data: changePasswordDTO) => {
        setIsSubmitting(true);
        try {
            const result = await profileService.changePassword({
                oldPassword: data.oldPassword,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword
            });

            if (result.success) {
                toast.success(result.message || "Security credentials updated.");
                navigate("/tenant/profile");
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error('Failed to update password. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center px-6 font-sans">
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] w-full max-w-md p-10 shadow-sm rounded-xl">
                
              
                <div className="text-center mb-8">
                    <p className="text-[#475569] text-sm mt-2">
                        Update your tenant administrative password
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    
                   
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
                                Current Password
                            </label>
                            <button
                                type="button"
                                onClick={() => navigate("/tenant/forgot-pass")}
                                className="text-[11px] text-[#2F6FED] font-semibold hover:underline"
                            >
                                Forgot?
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                {...register("oldPassword")}
                                type={showOldPassword ? "text" : "password"}
                                className={`w-full bg-white border ${errors.oldPassword ? 'border-red-300 bg-red-50' : 'border-[#E2E8F0]'} rounded-lg px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2F6FED20] focus:border-[#2F6FED] transition-all`}
                                placeholder="Enter current password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569]"
                            >
                                {showOldPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                            </button>
                        </div>
                        {errors.oldPassword && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.oldPassword.message}</p>}
                    </div>

                    <div className="h-[1px] bg-[#F1F5F9] w-full"></div>

                    
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#475569] mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                {...register("newPassword")}
                                type={showNewPassword ? "text" : "password"}
                                className={`w-full bg-white border ${errors.newPassword ? 'border-red-300 bg-red-50' : 'border-[#E2E8F0]'} rounded-lg px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2F6FED20] focus:border-[#2F6FED] transition-all`}
                                placeholder="Min. 8 characters"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569]"
                            >
                                {showNewPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                            </button>
                        </div>
                        {errors.newPassword && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.newPassword.message}</p>}
                    </div>

                   
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#475569] mb-2">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                {...register("confirmPassword")}
                                type={showConfirmPassword ? "text" : "password"}
                                className={`w-full bg-white border ${errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-[#E2E8F0]'} rounded-lg px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2F6FED20] focus:border-[#2F6FED] transition-all`}
                                placeholder="Re-type new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569]"
                            >
                                {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.confirmPassword.message}</p>}
                    </div>

                   
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#2F6FED] text-white py-3.5 rounded-lg text-sm font-semibold hover:bg-[#1E5AD1] shadow-md shadow-blue-100 transition-all duration-200 disabled:opacity-50 flex justify-center items-center"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Updating...
                            </span>
                        ) : "Save New Password"}
                    </button>
                </form>

                {/* Back Link */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-sm text-[#475569] font-medium hover:text-[#2F6FED] transition-colors"
                    >
                        ← Back to Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TenantChangePasswordPage;