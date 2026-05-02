import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { changeEmailSchema } from "../../types/profile.dto";
import type { changeEmailDTO } from '../../types/profile.dto'
import profileService from "../../services/profileManagement.service";
import toast from "react-hot-toast";

const ChangeEmailPage: React.FC = () => {
    const navigate = useNavigate()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<changeEmailDTO>({
        resolver: yupResolver(changeEmailSchema)
    })

    const onSubmit = async (data: changeEmailDTO) => {
        setIsSubmitting(true)
        try {
            const result = await profileService.changeEmail({
                oldEmail: data.oldEmail,
                newEmail: data.newEmail,
                password: data.password
            })
            if (result.success) {
                localStorage.setItem(
                    "changeEmailVerificationData",
                    JSON.stringify({
                        email: result.data?.email,
                        expiresAt: result.data?.expiresAt
                    })
                )
                toast.success(result.message)
                navigate('/change-email-verify')
            }
            else {
                toast.error(result.message)
            }

        } catch (error) {
            toast.error('failed to update password', error!);
        }
        finally {
            setIsSubmitting(false)
        }

    }
    return (
        <div className="min-h-screen bg-[#FFF9F4] flex items-center justify-center px-6 font-sans">
            <div className="bg-[#FFFFFF] border border-[#E6E0DA] w-full max-w-sm p-8 shadow-sm">

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-[#1F1F1F] uppercase tracking-tighter italic underline decoration-[#C9653B] decoration-2 underline-offset-4">
                        Change Email
                    </h2>

                    <p className="text-[#6B6B6B] text-[10px] uppercase tracking-[0.2em] mt-3">
                        Update your <span className="text-[#1F1F1F] font-bold">Email Address</span>
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>


                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B6B6B] mb-2">
                            Current Email
                        </label>

                        <input
                            {...register("oldEmail")}
                            type="email"
                            className={`w-full bg-[#FFF9F4] border ${errors.oldEmail ? 'border-red-500' : 'border-[#E6E0DA]'
                                } px-4 py-3 text-sm text-[#1F1F1F] focus:outline-none focus:border-[#C9653B] transition-colors`}
                            placeholder="current@email.com"
                        />

                        {errors.oldEmail && (
                            <p className="text-[#D98880] text-[10px] mt-1 uppercase font-bold">
                                {errors.oldEmail.message}
                            </p>
                        )}
                    </div>


                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B6B6B] mb-2">
                            New Email
                        </label>

                        <input
                            {...register("newEmail")}
                            type="email"
                            className={`w-full bg-[#FFF9F4] border ${errors.newEmail ? 'border-red-500' : 'border-[#E6E0DA]'
                                } px-4 py-3 text-sm text-[#1F1F1F] focus:outline-none focus:border-[#C9653B] transition-colors`}
                            placeholder="new@email.com"
                        />

                        {errors.newEmail && (
                            <p className="text-[#D98880] text-[10px] mt-1 uppercase font-bold">
                                {errors.newEmail.message}
                            </p>
                        )}
                    </div>

                    <div className="h-[1px] bg-[#E6E0DA] w-full my-2"></div>


                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B6B6B] mb-2">
                            Account Password
                        </label>

                        <div className="relative">
                            <input
                                {...register("password")}
                                type={showPassword ? "text" : "password"}
                                className={`w-full bg-[#FFF9F4] border ${errors.password ? 'border-red-500' : 'border-[#E6E0DA]'
                                    } px-4 py-3 text-sm text-[#1F1F1F] focus:outline-none focus:border-[#C9653B] transition-colors`}
                                placeholder="••••••••"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]"
                            >
                                {showPassword ? (
                                    <FaEyeSlash size={14} />
                                ) : (
                                    <FaEye size={14} />
                                )}
                            </button>
                        </div>

                        {errors.password && (
                            <p className="text-[#D98880] text-[10px] mt-1 uppercase font-bold">
                                {errors.password.message}
                            </p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#C9653B] text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#1F1F1F] transition-all duration-300 disabled:opacity-50"
                    >
                        {isSubmitting ? "Processing..." : "Verify & Continue"}
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

}
export default ChangeEmailPage