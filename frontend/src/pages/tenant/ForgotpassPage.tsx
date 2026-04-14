import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import authService from "../../services/auth.service";
import toast from "react-hot-toast";

const schema = yup.object({
    email: yup.string().email("Invalid business email").required("Email is required"),
}).required();

const TenantForgotPassPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data: { email: string }) => {
        setIsLoading(true);
        try {
            const payload = {
                email: data.email,
                role: 'tenant'
            }
            const result = await authService.forgotpass(payload) as any;

            if (result && result.success) {
                toast.success(result.message || "Recovery code sent successfully");
                navigate("/tenant/forgot-verify-otp", {
                    state: {
                        email: data.email,
                        role: 'tenant',
                        isForgotPassword: true,
                        expiresAt: result.expiresAt
                    }
                });
            } else {
                toast.error(result.message || 'Failed to send recovery code');
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Something went wrong";
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };
    const inputStyle = "w-full bg-[#FFFFFF] border border-[#E2E8F0] px-4 py-3 rounded-lg text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#2F6FED]/20 focus:border-[#2F6FED] transition-all placeholder:text-[#94A3B8]";
    const labelStyle = "block text-[10px] font-bold uppercase tracking-widest text-[#475569] mb-1.5";

    return (
        <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center px-6 font-sans">
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] w-full max-w-sm p-10 rounded-2xl shadow-sm">


                <div className="text-center mb-10">
                    <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
                        Account Recovery
                    </h2>
                    <p className="text-[#475569] text-[11px] font-medium uppercase tracking-wider mt-2 leading-relaxed">
                        Reset your Auction House access <br /> via business email
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className={labelStyle}>
                            Business Email
                        </label>
                        <input
                            {...register("email")}
                            type="email"
                            disabled={isLoading}
                            className={inputStyle}
                            placeholder="admin@auctionhouse.com"
                        />
                        {errors.email && (
                            <p className="text-[#EF4444] text-[9px] mt-1 uppercase font-bold">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#2F6FED] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#2557C8] transition-all shadow-md shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </>
                        ) : (
                            "Send Recovery Code"
                        )}
                    </button>
                </form>


                <div className="mt-10 pt-8 border-t border-[#E2E8F0] text-center">
                    <p className="text-[11px] text-[#475569] font-medium uppercase tracking-wider">
                        Found your credentials?
                        <Link
                            to="/tenant/login"
                            className="text-[#2F6FED] font-extrabold hover:underline ml-1"
                        >
                            Return to Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TenantForgotPassPage;