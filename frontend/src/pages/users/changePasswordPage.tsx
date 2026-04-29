import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { changePasswordSchema } from "../../types/profile.dto";
import type { changePasswordDTO } from "../../types/profile.dto";
import profileService from "../../services/profileManagement.service";

import toast from "react-hot-toast";

const ChangePasswordPage: React.FC = () => {
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
                toast.success(result.message || "Password updated successfully.");
                navigate("/profile");
            } else {
                toast.error(result.message);
            }
        } catch (err) {
            toast.error('failed to update password', err!);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF9F4] flex items-center justify-center px-6 font-sans">
            <div className="bg-[#FFFFFF] border border-[#E6E0DA] w-full max-w-sm p-8 shadow-sm">

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-[#1F1F1F] uppercase tracking-tighter italic underline decoration-[#C9653B] decoration-2 underline-offset-4">
                        Security
                    </h2>
                    <p className="text-[#6B6B6B] text-[10px] uppercase tracking-[0.2em] mt-3">
                        Update your <span className="text-[#1F1F1F] font-bold">Access Credentials</span>
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>


                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B6B6B] mb-2">Current Password</label>
                        <div className="relative">
                            <input
                                {...register("oldPassword")}
                                type={showOldPassword ? "text" : "password"}
                                className={`w-full bg-[#FFF9F4] border ${errors.oldPassword ? 'border-red-500' : 'border-[#E6E0DA]'} px-4 py-3 text-sm text-[#1F1F1F] focus:outline-none focus:border-[#C9653B] transition-colors`}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]"
                            >
                                {showOldPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                            </button>
                        </div>
                        <div className="flex justify-end mt-1">
                            <button
                                type="button"
                                onClick={() => navigate("")}
                                className="text-[9px] text-[#C9653B] uppercase font-bold tracking-wider hover:underline underline-offset-2"
                            >
                                Forgot current password?
                            </button>
                        </div>
                        {errors.oldPassword && <p className="text-[#D98880] text-[10px] mt-1 uppercase font-bold">{errors.oldPassword.message}</p>}
                    </div>

                    <div className="h-[1px] bg-[#E6E0DA] w-full my-2"></div>


                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B6B6B] mb-2">New Password</label>
                        <div className="relative">
                            <input
                                {...register("newPassword")}
                                type={showNewPassword ? "text" : "password"}
                                className={`w-full bg-[#FFF9F4] border ${errors.newPassword ? 'border-red-500' : 'border-[#E6E0DA]'} px-4 py-3 text-sm text-[#1F1F1F] focus:outline-none focus:border-[#C9653B] transition-colors`}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]"
                            >
                                {showNewPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                            </button>
                        </div>
                        {errors.newPassword && <p className="text-[#D98880] text-[10px] mt-1 uppercase font-bold">{errors.newPassword.message}</p>}
                    </div>


                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B6B6B] mb-2">Confirm New Password</label>
                        <div className="relative">
                            <input
                                {...register("confirmPassword")}
                                type={showConfirmPassword ? "text" : "password"}
                                className={`w-full bg-[#FFF9F4] border ${errors.confirmPassword ? 'border-red-500' : 'border-[#E6E0DA]'} px-4 py-3 text-sm text-[#1F1F1F] focus:outline-none focus:border-[#C9653B] transition-colors`}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]"
                            >
                                {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="text-[#D98880] text-[10px] mt-1 uppercase font-bold">{errors.confirmPassword.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#C9653B] text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#1F1F1F] transition-all duration-300 disabled:opacity-50"
                    >
                        {isSubmitting ? "Processing..." : "Verify & Update"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-[#E6E0DA] text-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-[10px] text-[#6B6B6B] uppercase tracking-[0.15em] font-medium hover:text-[#C9653B]"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordPage;