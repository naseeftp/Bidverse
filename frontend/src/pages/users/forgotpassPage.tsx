import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import authService from "../../services/auth.service";
import toast from "react-hot-toast";
const schema = yup.object({
    email: yup.string().email("Invalid email").required("Email is required"),
}).required();

const ForgotPassPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data: { email: string }) => {
        try {
            const payload = {
                email: data.email,
                role: 'user'
            }
            const result = await authService.forgotpass(payload)
            console.log(result)
            if (result && result.success) {
                toast.success(result.message)
                navigate("/forgot-verify-otp", {
                    
                    state: {
                        email: data.email,
                        role: 'user',
                        isForgotPassword: true,
                        expiresAt: result.data?.expiresAt
                    }
                });
            } else {
                toast.error(result.message || 'failed to send to recovery code')
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Something went wrong";
            toast.error(errorMsg);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF9F4] flex items-center justify-center px-6 font-sans">
            <div className="bg-[#FFFFFF] border border-[#E6E0DA] w-full max-w-sm p-8 shadow-sm">

                {/* Header Section */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-[#1F1F1F] uppercase tracking-tighter italic">
                        Reset Access
                    </h2>
                    <p className="text-[#6B6B6B] text-[10px] uppercase tracking-[0.2em] mt-2 leading-relaxed">
                        Enter your email to receive <br /> a recovery OTP
                    </p>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#6B6B6B] mb-1.5">
                            Email Address
                        </label>
                        <input
                            {...register("email")}
                            type="email"
                            className="w-full bg-[#FFF9F4] border border-[#E6E0DA] px-4 py-2.5 text-sm text-[#1F1F1F] focus:outline-none focus:border-[#C9653B] transition-colors"
                            placeholder="email@example.com"
                        />
                        {errors.email && (
                            <p className="text-[#D98880] text-[9px] mt-1 uppercase font-bold">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#C9653B] text-white py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-[#1F1F1F] transition-all duration-300"
                    >
                        Verify Email
                    </button>
                </form>

                {/* Footer Section */}
                <div className="mt-8 pt-6 border-t border-[#E6E0DA] text-center">
                    <p className="text-[9px] text-[#6B6B6B] uppercase tracking-[0.15em] font-medium">
                        Remembered your password?
                        <Link
                            to="/login"
                            className="text-[#1F1F1F] font-bold hover:text-[#C9653B] transition-colors ml-1 text-[10px]"
                        >
                            Back to Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassPage;