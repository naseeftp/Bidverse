import React, { useState } from "react";
import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from 'yup';
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/auth.service";
import { useAppDispatch } from "../../hooks/redux.hooks";
import { setRegistrationData } from "../../redux/user/auth.slice";
import type { RegisterDTO } from "../../types/auth.type";
import toast from "react-hot-toast";

const baseURL = import.meta.env.VITE_API_URL;
const schema: yup.ObjectSchema<RegisterDTO> = yup.object({
    name: yup.string().max(50, 'Name cannot exceed 50 characters').required('Full name is required'),
    email: yup.string().email('Invalid email').max(100, 'Email cannot exceed 100 characters').required('Email is required'),
    phone: yup.string().matches(/^\d{10}$/, 'Phone must be exactly 10 digits').max(10, 'Phone cannot exceed 10 digits').required('Phone number is required'),
    password: yup.string().min(8, 'Password must be minimum 8 characters').max(32, 'Password cannot exceed 32 characters').required(),
    confirmPassword: yup.string()
        .max(32, 'Confirm password too long')
        .oneOf([yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
    role: yup.string().oneOf(['user', 'admin', 'tenant'] as const).default('user'),
}).required();

const RegisterPage: React.FC = () => {
    const [serverError, setServerError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterDTO>({
        resolver: yupResolver(schema),
        defaultValues: { 
            role: 'user',
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: ''
        }
    });

    const handleGoogleSignup = (role: 'user' | 'tenant') => {
        window.location.href = `${baseURL}/auth/google?role=${role}`;
    };

    const onSubmit = async (data: RegisterDTO) => {
        setLoading(true);
        setServerError(null);
        
        try {
            const result = await authService.register(data);
            if (result && result.success) {
                toast.success(result.message || "Registration in progress! Verify your email");
                const expiresAt = (result as { expiresAt?: string }).expiresAt;
                dispatch(setRegistrationData({ 
                    email: data.email, 
                    role: 'user', 
                    phone: data.phone 
                }));

                navigate('/verify-otp', { 
                    state: { 
                        email: data.email, 
                        expiresAt: expiresAt 
                    } 
                });
            } else {
                setServerError(result.message || "Registration failed");
                toast.error(result.message || "Registration failed");
            }
        } catch {
            const msg = "An unexpected error occurred during registration.";
            setServerError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF9F4] flex items-center justify-center px-6 py-20 font-sans">
            <div className="bg-[#FFFFFF] border border-[#E6E0DA] w-full max-w-lg p-10 shadow-sm">

                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-[#1F1F1F] uppercase tracking-tighter italic underline decoration-[#C9653B] decoration-2 underline-offset-8">
                        Join the Auction
                    </h2>
                    <p className="text-[#6B6B6B] text-[10px] uppercase tracking-[0.2em] mt-4">Create your bidder account</p>
                </div>

                {serverError && (
                    <div className="mb-6 p-4 bg-[#D98880]/5 border border-[#D98880] text-[#D98880] text-[10px] font-bold uppercase tracking-widest text-center">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="hidden" {...register('role')} />

                    {/* Full Name */}
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B6B6B] mb-2">Full Name</label>
                        <input 
                            {...register('name')} 
                            className={`w-full bg-[#FFF9F4] border ${errors.name ? 'border-red-400' : 'border-[#E6E0DA]'} px-4 py-3 text-sm text-[#1F1F1F] focus:outline-none focus:border-[#C9653B] transition-colors`} 
                            placeholder="Naseef" 
                        />
                        {errors.name && <p className="text-[#D98880] text-[10px] mt-1 uppercase font-bold">{errors.name.message}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B6B6B] mb-2">Email Address</label>
                        <input 
                            {...register('email')} 
                            type="email"
                            className={`w-full bg-[#FFF9F4] border ${errors.email ? 'border-red-400' : 'border-[#E6E0DA]'} px-4 py-3 text-sm text-[#1F1F1F] focus:outline-none focus:border-[#C9653B] transition-colors`} 
                            placeholder="email@example.com" 
                        />
                        {errors.email && <p className="text-[#D98880] text-[10px] mt-1 uppercase font-bold">{errors.email.message}</p>}
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B6B6B] mb-2">Phone Number</label>
                        <input 
                            {...register('phone')} 
                            className={`w-full bg-[#FFF9F4] border ${errors.phone ? 'border-red-400' : 'border-[#E6E0DA]'} px-4 py-3 text-sm text-[#1F1F1F] focus:outline-none focus:border-[#C9653B] transition-colors`} 
                            placeholder="0123456789" 
                        />
                        {errors.phone && <p className="text-[#D98880] text-[10px] mt-1 uppercase font-bold">{errors.phone.message}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B6B6B] mb-2">Password</label>
                        <input 
                            type="password" 
                            {...register('password')} 
                            className={`w-full bg-[#FFF9F4] border ${errors.password ? 'border-red-400' : 'border-[#E6E0DA]'} px-4 py-3 text-sm text-[#1F1F1F] focus:outline-none focus:border-[#C9653B] transition-colors`} 
                            placeholder="••••••••" 
                        />
                        {errors.password && <p className="text-[#D98880] text-[10px] mt-1 uppercase font-bold">{errors.password.message}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B6B6B] mb-2">Confirm Password</label>
                        <input 
                            type="password" 
                            {...register('confirmPassword')} 
                            className={`w-full bg-[#FFF9F4] border ${errors.confirmPassword ? 'border-red-400' : 'border-[#E6E0DA]'} px-4 py-3 text-sm text-[#1F1F1F] focus:outline-none focus:border-[#C9653B] transition-colors`} 
                            placeholder="••••••••" 
                        />
                        {errors.confirmPassword && <p className="text-[#D98880] text-[10px] mt-1 uppercase font-bold">{errors.confirmPassword.message}</p>}
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="md:col-span-2 w-full bg-[#C9653B] text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#1F1F1F] transition-all duration-300 disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Create Bidder Account'}
                    </button>
                </form>

                <div className="mt-8 space-y-4">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#E6E0DA]"></span></div>
                        <span className="relative bg-white px-4 text-[9px] uppercase tracking-widest text-[#6B6B6B] font-bold">Or continuation</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => handleGoogleSignup('user')}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-[#1F1F1F] py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-[#1F1F1F] hover:text-white transition-all duration-500 group"
                    >
                        <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-4 h-4 group-hover:brightness-200 transition-all" alt="G" />
                        Signup with Google
                    </button>
                </div>

                <div className="mt-12 pt-8 border-t border-[#E6E0DA] space-y-6 text-center">
                    <p className="text-[10px] text-[#6B6B6B] uppercase tracking-[0.15em] font-medium">
                        Already have an account? <Link to="/login" className="text-[#1F1F1F] font-bold hover:text-[#C9653B] transition-colors ml-1 underline underline-offset-2">Login</Link>
                    </p>

                    <div className="bg-[#FFF9F4] p-6 border border-[#E6E0DA]">
                        <p className="text-[10px] text-[#6B6B6B] uppercase tracking-[0.15em] mb-3">Looking to sell rare items?</p>
                        <Link
                            to="/tenant/register"
                            className="inline-block text-[11px] font-bold uppercase tracking-widest border-b-2 border-[#C9653B] text-[#1F1F1F] hover:bg-[#C9653B] hover:text-white hover:border-transparent px-2 py-1 transition-all"
                        >
                            Become an Auction House
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;