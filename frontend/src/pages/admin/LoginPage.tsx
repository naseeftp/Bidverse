import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from 'yup';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../../hooks/redux.hooks";
import { setAuthError, setAuthSuccess, setLoading } from "../../redux/user/auth.slice";
import authService from "../../services/auth.service";
import toast from "react-hot-toast";
import type{ JwtPayload } from "../../types/auth.type";
import { Roles } from "../../types/auth.type";

// 1. Define the correct nested structure for Admin
interface IAdminLoginResponse {
    success: boolean;
    message: string;
    data: {
        user: JwtPayload;
        token: string;
        refreshToken: string;
    };
}

const schema = yup.object({
    email: yup.string().email('Invalid administrative email').required('Email is required'),
    password: yup.string().required('Password is required')
}).required();

interface IAdminLoginData {
    email: string;
    password: string;
}

const AdminLoginPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { loading } = useAppSelector((state) => state.auth);
    
    const { register, handleSubmit, formState: { errors } } = useForm<IAdminLoginData>({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data: IAdminLoginData) => {
        dispatch(setLoading(true));
        try {
            const loginData = { ...data, role: Roles.ADMIN };
            
            // 2. Cast to the correct response type
            const result = (await authService.login(loginData)) as IAdminLoginResponse;

            // 3. Drill into result.data
            if (result && result.success && result.data) {
                const { user, token } = result.data;

                // Save token to localStorage
                localStorage.setItem('accessToken', token);
                
                // Update Redux state with the user object
                dispatch(setAuthSuccess(user));
                
                toast.success(result.message || "System Connection Established");
                navigate('/admin/dashboard');
            } else {
                const errorMessage = result?.message || "Login failed";
                dispatch(setAuthError(errorMessage));
                toast.error(errorMessage);
            }
        } catch (error: unknown) {
            let serverMessage = "Login failed";
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { message?: string } } };
                serverMessage = axiosError.response?.data?.message || serverMessage;
            }
            dispatch(setAuthError(serverMessage));
            toast.error(serverMessage);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const inputStyle = "w-full bg-[#FFFFFF] border border-[#E5E7EB] px-4 py-3 rounded-md text-[#0F172A] text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all placeholder:text-[#94A3B8]";
    const labelStyle = "block text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B7280]";

    return (
        <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center px-6 font-sans">
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] w-full max-w-md p-10 md:p-14 shadow-2xl rounded-sm">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-light text-[#0F172A] uppercase tracking-[0.25em]">Admin Portal</h2>
                    <div className="h-1 w-12 bg-[#D4AF37] mx-auto mt-4"></div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
                    <div className="space-y-2">
                        <label className={labelStyle}>System Identifier</label>
                        <input
                            {...register('email')}
                            type="email"
                            className={inputStyle}
                            placeholder="admin@system.com"
                        />
                        {errors.email && (
                            <p className="text-[#DC2626] text-[9px] font-bold uppercase tracking-widest mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className={labelStyle}>Security Key</label>
                        </div>
                        <div className="relative">
                            <input
                                {...register('password')}
                                type={showPassword ? "text" : "password"}
                                className={inputStyle}
                                placeholder="••••••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#D4AF37] transition-colors"
                            >
                                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-[#DC2626] text-[9px] font-bold uppercase tracking-widest mt-1">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#111827] text-[#D4AF37] py-4 text-xs font-bold uppercase tracking-[0.3em] hover:bg-[#1F2937] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 border border-[#D4AF37]/20"
                        >
                            {loading ? "Authorizing..." : "Establish Connection"}
                        </button>
                    </div>
                </form>

                <div className="mt-12 pt-8 border-t border-[#E5E7EB] text-center">
                    <p className="text-[9px] text-[#6B7280] font-medium uppercase tracking-[0.15em] leading-relaxed mb-6">
                        Access Restricted to Authorized Personnel Only. <br />
                        All activity is monitored and encrypted.
                    </p>

                    <Link
                        to="/login"
                        className="text-[10px] font-bold uppercase tracking-widest text-[#0F172A] hover:text-[#D4AF37] transition-colors group"
                    >
                        <span className="border-b border-transparent group-hover:border-[#D4AF37] pb-1">
                            Exit to User Login
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;