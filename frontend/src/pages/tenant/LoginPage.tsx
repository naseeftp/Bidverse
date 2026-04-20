import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from 'yup';
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../../hooks/redux.hooks";
import { setAuthError, setAuthSuccess, setLoading } from "../../redux/user/auth.slice";
import { Roles } from "../../types/auth.type"; 
import type{ userRole } from "../../types/auth.type";
import type { JwtPayload } from "../../types/auth.type";
import authService from "../../services/auth.service";
import toast from "react-hot-toast";

interface AuthSuccessData {
    token: string;
    refreshToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        profileImage: string | null;
        isActive: boolean;
    };
}

type LoginResponse = 
    | { success: true; message: string; data: AuthSuccessData }
    | { success: false; message: string; data?: never };

interface LoginFormInputs {
    email: string;
    password: string;
}

interface AxiosErrorResponse {
    response?: {
        data?: {
            message?: string;
        };
    };
}

const schema = yup.object({
    email: yup.string().email('Invalid business email').required('Email is required'),
    password: yup.string().required('Password is required')
}).required();

const baseURL = import.meta.env.VITE_API_URL;

const TenantLoginPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const { loading } = useAppSelector((state) => state.auth);
    const toastShown = useRef(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
        resolver: yupResolver(schema),
    });

    useEffect(() => {
        const errMessage = searchParams.get("error");
        if (errMessage && !toastShown.current) {
            const decodedError = decodeURIComponent(errMessage);
            toast.error(decodedError);
            dispatch(setAuthError(decodedError));
            toastShown.current = true;
            navigate(window.location.pathname, { replace: true });
        }
    }, [dispatch, searchParams, navigate]);

    const handleGoogleLogin = () => {
        window.location.href = `${baseURL}/auth/google?role=tenant`;
    };

    const onSubmit = async (data: LoginFormInputs) => {
        dispatch(setLoading(true));
        try {
            const loginData = { ...data, role: Roles.TENANT };
            const result = await authService.login(loginData) as LoginResponse;

            if (result.success && result.data) {
                const { token, user, refreshToken } = result.data;

                localStorage.setItem("accessToken", token);
                localStorage.setItem("refreshToken", refreshToken);
                const userPayload: JwtPayload = {
                    userId: user.id,
                    email: user.email,
                    role: user.role as userRole,
                    name: user.name,
                    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
                };

                dispatch(setAuthSuccess(userPayload));
                toast.success(result.message || "Welcome to your House Dashboard");
                navigate('/tenant/dashboard');
            } else {
                const errorMsg = result.message || "Invalid credentials for Auction House";
                dispatch(setAuthError(errorMsg));
                toast.error(errorMsg);
            }
        } catch (error: unknown) {
            const err = error as AxiosErrorResponse;
            const serverMessage = err.response?.data?.message || "Login failed";
            dispatch(setAuthError(serverMessage));
            toast.error(serverMessage);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const inputStyle = "w-full bg-[#FFFFFF] border border-[#E2E8F0] px-4 py-3 rounded-lg text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#2F6FED]/20 focus:border-[#2F6FED] transition-all placeholder:text-[#94A3B8]";
    const labelStyle = "block text-[10px] font-bold uppercase tracking-widest text-[#475569]";

    return (
        <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center px-6 font-sans">
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] w-full max-w-sm p-10 rounded-2xl shadow-sm">
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">House Portal</h2>
                    <p className="text-[#475569] text-[11px] font-medium uppercase tracking-wider mt-2">Manage your auctions & bidders</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label className={labelStyle}>Business Email</label>
                        <input
                            {...register('email')}
                            type="email"
                            className={inputStyle}
                            placeholder="admin@auctionhouse.com"
                        />
                        {errors.email && (
                            <p className="text-[#EF4444] text-[9px] font-bold uppercase">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className={labelStyle}>Password</label>
                            <Link to="/tenant/forgot-pass" className="text-[10px] font-bold text-[#2F6FED] hover:underline">
                                Forgot?
                            </Link>
                        </div>
                        <div className="relative">
                            <input
                                {...register('password')}
                                type={showPassword ? "text" : "password"}
                                className={inputStyle}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition-colors"
                            >
                                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-[#EF4444] text-[9px] font-bold uppercase">{errors.password.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#2F6FED] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#2557C8] transition-all shadow-md shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? "Authorizing..." : "Sign In to Dashboard"}
                    </button>

                    <div className="relative flex items-center justify-center py-2">
                        <div className="flex-grow border-t border-[#E2E8F0]"></div>
                        <span className="flex-shrink mx-4 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Or</span>
                        <div className="flex-grow border-t border-[#E2E8F0]"></div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full bg-white border border-[#E2E8F0] flex items-center justify-center gap-3 py-3.5 rounded-xl text-[#0F172A] text-[11px] font-bold uppercase tracking-widest hover:bg-[#F8FAFC] transition-all"
                    >
                        <FcGoogle className="text-lg" />
                        Google for Business
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-[#E2E8F0] text-center space-y-6">
                    <p className="text-[11px] text-[#475569] font-medium uppercase tracking-wider">
                        Not a registered house?
                        <Link to="/tenant/register" className="text-[#2F6FED] font-extrabold hover:underline ml-1">
                            Register Now
                        </Link>
                    </p>

                    <div className="bg-[#F5F7FB] p-4 rounded-xl border border-[#E2E8F0]">
                        <p className="text-[9px] text-[#475569] uppercase font-bold tracking-widest mb-2">Looking to buy items?</p>
                        <Link
                            to="/login"
                            className="text-[10px] font-bold uppercase tracking-widest text-[#0F172A] hover:text-[#2F6FED] flex items-center justify-center gap-1"
                        >
                            ← Switch to Bidder Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TenantLoginPage;