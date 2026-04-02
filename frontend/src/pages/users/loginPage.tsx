import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from 'yup';
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../../hooks/redux.hooks";
import { setAuthError, setAuthSuccess, setLoading } from "../../redux/user/auth.slice";
import authService from "../../services/auth.service";
import toast from "react-hot-toast";

const schema = yup.object({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().required('Password is required')
}).required();

const LoginPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    
    // Pull global loading state from Redux
    const { loading } = useAppSelector((state) => state.auth);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data: any) => {
    dispatch(setLoading(true));
    try {
        const loginData = { ...data, role: "user" };
        const result = await authService.login(loginData);
        console.log(result)
        if (result && result.success) {
            dispatch(setAuthSuccess(result.user));
            toast.success(result.message || "Welcome to BidVerse");
            navigate('/home');
        } else {
            // This handles cases where the server returns 200 but success: false
            const errorMsg = result?.message || "Invalid email or password";
            dispatch(setAuthError(errorMsg));
            toast.error(errorMsg);
        }
    } catch (error: any) {
       const serverMessage = error.response?.data?.message || "Invalid email or password";
        dispatch(setAuthError(serverMessage));
        toast.error(serverMessage);
    } finally {
        dispatch(setLoading(false));
    }
};

    return (
        <div className="min-h-screen bg-[#FFF9F4] flex items-center justify-center px-6">
            <div className="bg-[#FFFFFF] border border-[#E6E0DA] w-full max-w-sm p-8 shadow-sm">

                {/* Header Section */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-[#1F1F1F] uppercase tracking-tighter italic">Welcome Back</h2>
                    <p className="text-[#6B6B6B] text-[10px] uppercase tracking-[0.2em] mt-1">Access your bidder dashboard</p>
                </div>

                <form 
  onSubmit={(e) => {
    e.preventDefault(); // Stop the reload first
    handleSubmit(onSubmit)(e);
  }} 
  className="space-y-5"
>
                    {/* Email Input */}
                    <div>
                        <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#6B6B6B] mb-1.5">
                            Email Address
                        </label>
                        <input
                            {...register('email')}
                            type="email"
                            className="w-full bg-[#FFF9F4] border border-[#E6E0DA] px-4 py-2.5 text-sm text-[#1F1F1F] focus:outline-none focus:border-[#C9653B] transition-colors"
                            placeholder="email@example.com"
                        />
                        {errors.email && (
                            <p className="text-[#D98880] text-[9px] mt-1 uppercase font-bold">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password Input with Eye Toggler */}
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#6B6B6B]">
                                Password
                            </label>
                           <Link to="/forgot-password" className="size-2 text-[9px] font-bold text-[#C9653B] uppercase tracking-widest hover:underline">                                Forgot?
                            </Link>
                        </div>
                        <div className="relative">
                            <input
                                {...register('password')}
                                type={showPassword ? "text" : "password"}
                                className="w-full bg-[#FFF9F4] border border-[#E6E0DA] px-4 py-2.5 text-sm text-[#1F1F1F] focus:outline-none focus:border-[#C9653B]"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors focus:outline-none"
                            >
                                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-[#D98880] text-[9px] mt-1 uppercase font-bold">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Login Button - Syncs with Redux Loading */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#C9653B] text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#1F1F1F] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Authenticating..." : "Sign In"}
                    </button>

                    <div className="relative flex items-center justify-center py-1">
                        <div className="flex-grow border-t border-[#E6E0DA]"></div>
                        <span className="flex-shrink mx-3 text-[9px] font-bold text-[#6B6B6B] uppercase tracking-widest">Or</span>
                        <div className="flex-grow border-t border-[#E6E0DA]"></div>
                    </div>

                    <button
                        type="button"
                        onClick={() => console.log("Google Login Clicked")}
                        className="w-full bg-white border border-[#E6E0DA] flex items-center justify-center gap-3 py-2.5 text-[#1F1F1F] text-[10px] font-bold uppercase tracking-widest hover:bg-[#FFF9F4] transition-all"
                    >
                        <FcGoogle className="text-lg" />
                        Continue with Google
                    </button>
                </form>

                {/* Footer Section */}
                <div className="mt-8 pt-6 border-t border-[#E6E0DA] text-center space-y-5">
                    <p className="text-[9px] text-[#6B6B6B] uppercase tracking-[0.15em] font-medium">
                        New to the platform?
                        <Link to="/register" className="text-[#1F1F1F] font-bold hover:text-[#C9653B] transition-colors ml-1 text-[10px]">
                            Create Account
                        </Link>
                    </p>

                    <div className="bg-[#FFF9F4] p-3 border border-[#E6E0DA]">
                        <p className="text-[8px] text-[#6B6B6B] uppercase tracking-[0.15em] mb-1">Are you an Auction House?</p>
                        <Link 
                            to="/login/tenant" 
                            className="text-[9px] font-bold uppercase tracking-widest text-[#C9653B] hover:text-[#1F1F1F] transition-colors"
                        >
                            Sign in as Tenant →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;