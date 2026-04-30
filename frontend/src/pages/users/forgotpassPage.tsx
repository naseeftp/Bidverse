import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import authService from "../../services/auth.service";
import toast from "react-hot-toast";
import { useAppSelector } from "../../hooks/redux.hooks";

interface ForgotPassResponse {
    success: boolean;
    message: string;
    expiresAt?: string;
}


interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
}

const schema = yup.object({
    email: yup.string().email("Invalid email").required("Email is required"),
}).required();

type FormData = yup.InferType<typeof schema>;

const ForgotPassPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const { isAuthenticated } = useAppSelector((state) => state.auth)
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            const payload = {
                email: data.email,
                role: 'user' as const
            };


            const result = (await authService.forgotpass(payload)) as ForgotPassResponse;

            if (result && result.success) {
                toast.success(result.message);
                navigate("/forgot-verify-otp", {
                    state: {
                        email: data.email,
                        role: 'user',
                        isForgotPassword: true,
                        expiresAt: result.expiresAt
                    }
                });
            } else {
                toast.error(result.message || 'Failed to send recovery code');
            }
        } catch (error: unknown) {

            const err = error as ApiError;
            const errorMsg = err.response?.data?.message || "Something went wrong";
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF9F4] flex items-center justify-center px-6 font-sans">
            <div className="bg-[#FFFFFF] border border-[#E6E0DA] w-full max-w-sm p-8 shadow-sm">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-[#1F1F1F] uppercase tracking-tighter italic">
                        Reset Access
                    </h2>
                    <p className="text-[#6B6B6B] text-[10px] uppercase tracking-[0.2em] mt-2 leading-relaxed">
                        Enter your email to receive <br /> a recovery OTP
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#6B6B6B] mb-1.5">
                            Email Address
                        </label>
                        <input
                            {...register("email")}
                            type="email"
                            disabled={isLoading}
                            className="w-full bg-[#FFF9F4] border border-[#E6E0DA] px-4 py-2.5 text-sm text-[#1F1F1F] focus:outline-none focus:border-[#C9653B] transition-colors disabled:opacity-70"
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
                        disabled={isLoading}
                        className="w-full bg-[#C9653B] text-white py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-[#1F1F1F] transition-all duration-300 disabled:bg-[#6B6B6B] disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending...
                            </>
                        ) : (
                            "Verify Email"
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-[#E6E0DA] text-center">
                    <p className="text-[9px] text-[#6B6B6B] uppercase tracking-[0.15em] font-medium">
                        Remembered your password?
                        {isAuthenticated ? (
                            <Link
                                to="/profile"
                                className="text-[#1F1F1F] font-bold hover:text-[#C9653B] transition-colors ml-1 text-[10px]"
                            >
                                Back to Profile
                            </Link>
                        )
                            : (<Link
                                to="/login"
                                className="text-[#1F1F1F] font-bold hover:text-[#C9653B] transition-colors ml-1 text-[10px]"
                            >
                                Back to Sign In
                            </Link>)
                        }

                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassPage;