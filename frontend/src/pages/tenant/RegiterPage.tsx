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
    name: yup.string().max(50, 'Name cannot exceed 50 characters').required('Auction House name is required'),
    email: yup.string().email('Invalid email').max(100, 'Email cannot exceed 100 characters').required('Email is required'),
    phone: yup.string().matches(/^\d{10}$/, 'Phone must be exactly 10 digits').max(10, 'Phone cannot exceed 10 digits').required('Phone number is required'),
    password: yup.string().min(8, 'Password must be minimum 8 characters').max(32, 'Password cannot exceed 32 characters').required(),
    confirmPassword: yup.string()
        .max(32, 'Confirm password too long')
        .oneOf([yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
    role: yup.string().oneOf(['user', 'admin', 'tenant'] as const).default('tenant'),
}).required();

const TenantRegisterPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterDTO>({
        resolver: yupResolver(schema),
        defaultValues: { 
            role: 'tenant',
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: ''
        }
    });

    const inputStyle = "w-full bg-[#FFFFFF] border border-[#E2E8F0] px-4 py-3 rounded-lg text-[#0F172A] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2F6FED]/20 focus:border-[#2F6FED] transition-all placeholder:text-[#94A3B8]";
    const labelStyle = "block text-[11px] font-semibold uppercase tracking-wider text-[#475569] mb-2";

    const handleGoogleSignup = () => {
        window.location.href = `${baseURL}/auth/google?role=tenant`;
    };

    // 3. Typed onSubmit (No 'any')
    const onSubmit = async (data: RegisterDTO) => {
        setLoading(true);
        try {
            const result = await authService.register(data);
            
            if (result && result.success) {
                toast.success(result.message || "Registration in progress! Verify your email");
                
                // 4. Safe access to expiresAt
                const registrationResult = result as { expiresAt?: string };
                
                dispatch(setRegistrationData({ 
                    email: data.email, 
                    role: 'tenant', 
                    phone: data.phone 
                }));

                navigate('/tenant/verify-otp', { 
                    state: { 
                        email: data.email, 
                        expiresAt: registrationResult.expiresAt 
                    } 
                });
            } else {
                toast.error(result.message || "Registration failed");
            }
        } catch {
            toast.error("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center px-6 py-12 font-sans">
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] w-full max-w-lg p-10 md:p-12 rounded-2xl shadow-sm">

                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Auction House</h2>
                    <p className="text-[#475569] text-sm mt-3 font-medium">Create a professional seller account</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <input type="hidden" {...register('role')} />

                    <div>
                        <label className={labelStyle}>Auction House Name</label>
                        <input {...register('name')} className={inputStyle} placeholder="e.g. Heritage Auctions Ltd." />
                        {errors.name && <p className="text-[#EF4444] text-[10px] mt-1 font-bold uppercase">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className={labelStyle}>Business Email</label>
                        <input {...register('email')} className={inputStyle} placeholder="admin@business.com" />
                        {errors.email && <p className="text-[#EF4444] text-[10px] mt-1 font-bold uppercase">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className={labelStyle}>Business Phone</label>
                        <input {...register('phone')} className={inputStyle} placeholder="+1 (555) 000-0000" />
                        {errors.phone && <p className="text-[#EF4444] text-[10px] mt-1 font-bold uppercase">{errors.phone.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelStyle}>Password</label>
                            <input type="password" {...register('password')} className={inputStyle} placeholder="••••••••" />
                            {errors.password && <p className="text-[#EF4444] text-[10px] mt-1 font-bold uppercase">{errors.password.message}</p>}
                        </div>
                        <div>
                            <label className={labelStyle}>Confirm</label>
                            <input type="password" {...register('confirmPassword')} className={inputStyle} placeholder="••••••••" />
                            {errors.confirmPassword && <p className="text-[#EF4444] text-[10px] mt-1 font-bold uppercase">{errors.confirmPassword.message}</p>}
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-[#2F6FED] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#2557C8] transition-all shadow-md shadow-blue-500/20 disabled:opacity-50">
                        {loading ? 'Processing...' : 'Register Auction House'}
                    </button>
                </form>

                <div className="mt-6 space-y-4">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#E2E8F0]"></span></div>
                        <span className="relative bg-white px-4 text-[10px] uppercase tracking-widest text-[#94A3B8] font-bold">Or</span>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleSignup}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-[#E2E8F0] py-4 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-[#F8FAFC] transition-all"
                    >
                        <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-4 h-4" alt="G" />
                        Signup as Tenant
                    </button>
                </div>

                <div className="mt-10 pt-8 border-t border-[#E2E8F0] text-center">
                    <p className="text-sm text-[#475569]">
                        Already have an account? <Link to="/tenant/login" className="text-[#2F6FED] font-bold ml-1 hover:underline">Login</Link>
                    </p>
                    <p className="text-[11px] text-[#94A3B8] uppercase tracking-widest mt-4">
                        Want to bid? <Link to="/register" className="text-[#0F172A] font-bold hover:text-[#2F6FED]">Switch to User</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TenantRegisterPage;