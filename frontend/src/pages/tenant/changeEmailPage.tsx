
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import { FaEye, FaEyeSlash} from "react-icons/fa";
import { changeEmailSchema } from "../../types/profile.dto";
import type { changeEmailDTO } from '../../types/profile.dto'
import profileService from '../../services/profileManagement.service'
import toast from "react-hot-toast";

const TenantChangeEmailPage: React.FC = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<changeEmailDTO>({
        resolver: yupResolver(changeEmailSchema)
    });

    const onSubmit = async (data: changeEmailDTO) => {
        setIsSubmitting(true);
        try {
            const result = await profileService.changeEmail({
                oldEmail: data.oldEmail,
                newEmail: data.newEmail,
                password: data.password
            });

            if (result.success) {
                localStorage.setItem(
                    "tenantEmailVerification",
                    JSON.stringify({
                        email: result.data?.email,
                        expiresAt: result.data?.expiresAt
                    })
                );
                toast.success(result.message || "Verification email sent.");
                navigate('/tenant/changeEmail-verify');
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Failed to initiate email change. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center px-6 font-sans">
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] w-full max-w-md p-10 shadow-sm rounded-xl">
                
               
                <div className="text-center mb-8">
                   
                    <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
                        Change Email
                    </h2>
                 
                </div>

                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    
                    
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#475569] mb-2">
                            Current Email Address
                        </label>
                        <input
                            {...register("oldEmail")}
                            type="email"
                            className={`w-full bg-white border ${errors.oldEmail ? 'border-red-300 ring-1 ring-red-100' : 'border-[#E2E8F0]'} rounded-lg px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2F6FED20] focus:border-[#2F6FED] transition-all`}
                            placeholder="admin@tenant.com"
                        />
                        {errors.oldEmail && (
                            <p className="text-[#EF4444] text-xs mt-1.5 font-medium italic">
                                {errors.oldEmail.message}
                            </p>
                        )}
                    </div>

                    
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#475569] mb-2">
                            New Email Address
                        </label>
                        <input
                            {...register("newEmail")}
                            type="email"
                            className={`w-full bg-white border ${errors.newEmail ? 'border-red-300 ring-1 ring-red-100' : 'border-[#E2E8F0]'} rounded-lg px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2F6FED20] focus:border-[#2F6FED] transition-all`}
                            placeholder="new-admin@tenant.com"
                        />
                        {errors.newEmail && (
                            <p className="text-[#EF4444] text-xs mt-1.5 font-medium italic">
                                {errors.newEmail.message}
                            </p>
                        )}
                    </div>

                    <div className="h-[1px] bg-[#F1F5F9] w-full my-2"></div>

                    
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#475569] mb-2">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                {...register("password")}
                                type={showPassword ? "text" : "password"}
                                className={`w-full bg-white border ${errors.password ? 'border-red-300 ring-1 ring-red-100' : 'border-[#E2E8F0]'} rounded-lg px-4 py-3 text-sm text-[#0F172A] placeholder="••••••••" focus:outline-none focus:ring-2 focus:ring-[#2F6FED20] focus:border-[#2F6FED] transition-all`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569]"
                            >
                                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-[#EF4444] text-xs mt-1.5 font-medium italic">
                                {errors.password.message}
                            </p>
                        )}
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
                                Sending Otp...
                            </span>
                        ) : "Update Admin Email"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-[#F1F5F9] text-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-sm text-[#475569] font-medium hover:text-[#2F6FED] transition-colors"
                    >
                        ← Return to Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TenantChangeEmailPage;