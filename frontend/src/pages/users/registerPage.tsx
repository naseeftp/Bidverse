import React, { useState } from "react";
import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from 'yup';//A JavaScript schema validation library.
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/auth.service";
import { useAppDispatch } from "../../hooks/redux.hooks";
import { setRegistrationData } from "../../redux/user/auth.slice";
import toast from "react-hot-toast";
const baseURL = import.meta.env.VITE_API_URL

const schema = yup.object({
    name: yup.string().required('Full name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    phone: yup.string().required('Phone number is required'),
    password: yup.string().min(6, 'Password must be minimum 8 characters').required(),
    confirmPassword: yup.string()
        .oneOf([yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
    role: yup.string().default('user'),
}).required();

const RegisterPage: React.FC = () => {
    const [serverError, setServerError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: { role: 'user' }
    });

    const handleGoogleSignup = (role: 'user' | 'tenant') => {
        window.location.href = `${baseURL}/auth/google?role=${role}`;
    };
    const onSubmit = async (data: any) => {
        setLoading(true);
        setServerError(null);
        const result = await authService.register(data);
        if (result && result.success) {
            toast.success(result.message || "Regsitration is on Progress! Verify your email")
            dispatch(setRegistrationData({ email: data.email, role: 'user', phone: data.phone }));
            navigate('/verify-otp', { state: { email: data.email, expiresAt: result.expiresAt } });
        } else {
            toast.error(result.message || "registration failed")
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#FFF9F4] flex items-center justify-center px-6 py-20">
            <div className="bg-[#FFFFFF] border border-[#E6E0DA] w-full max-w-lg p-10 shadow-sm">

                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-[#1F1F1F] uppercase tracking-tighter italic">Join the Auction</h2>
                    <p className="text-[#6B6B6B] text-xs uppercase tracking-[0.2em] mt-2">Create your bidder account</p>
                </div>

                {serverError && (
                    <div className="mb-6 p-3 bg-[#D98880]/10 border border-[#D98880] text-[#D98880] text-[10px] font-bold uppercase tracking-widest text-center">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Role Hidden Input */}
                    <input type="hidden" {...register('role')} />

                    {/* Full Name */}
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B6B6B] mb-2">Full Name</label>
                        <input {...register('name')} className="w-full bg-[#FFF9F4] border border-[#E6E0DA] px-4 py-3 text-[#1F1F1F] focus:outline-none focus:border-[#C9653B] transition-colors" placeholder="Naseef..." />
                        {errors.name && <p className="text-[#D98880] text-[10px] mt-1 uppercase font-bold">{errors.name.message}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B6B6B] mb-2">Email Address</label>
                        <input {...register('email')} className="w-full bg-[#FFF9F4] border border-[#E6E0DA] px-4 py-3 text-[#1F1F1F] focus:outline-none focus:border-[#C9653B] transition-colors" placeholder="email@example.com" />
                        {errors.email && <p className="text-[#D98880] text-[10px] mt-1 uppercase font-bold">{errors.email.message}</p>}
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B6B6B] mb-2">Phone Number</label>
                        <input {...register('phone')} className="w-full bg-[#FFF9F4] border border-[#E6E0DA] px-4 py-3 text-[#1F1F1F] focus:outline-none focus:border-[#C9653B] transition-colors" placeholder="0123456789" />
                        {errors.phone && <p className="text-[#D98880] text-[10px] mt-1 uppercase font-bold">{errors.phone.message}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B6B6B] mb-2">Password</label>
                        <input type="password" {...register('password')} className="w-full bg-[#FFF9F4] border border-[#E6E0DA] px-4 py-3 text-[#1F1F1F] focus:outline-none focus:border-[#C9653B]" placeholder="••••••••" />
                        {errors.password && <p className="text-[#D98880] text-[10px] mt-1 uppercase font-bold">{errors.password.message}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B6B6B] mb-2">Confirm Password</label>
                        <input type="password" {...register('confirmPassword')} className="w-full bg-[#FFF9F4] border border-[#E6E0DA] px-4 py-3 text-[#1F1F1F] focus:outline-none focus:border-[#C9653B]" placeholder="••••••••" />
                        {errors.confirmPassword && <p className="text-[#D98880] text-[10px] mt-1 uppercase font-bold">{errors.confirmPassword.message}</p>}
                    </div>

                    <button type="submit" disabled={loading} className="md:col-span-2 w-full bg-[#C9653B] text-white py-4 font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50">
                        {loading ? 'Verifying...' : 'Create Bidder Account'}
                    </button>
                </form>
                {/* Place this right after your </form> tag */}
                <div className="mt-6 space-y-4">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#E6E0DA]"></span></div>
                        <span className="relative bg-white px-4 text-[9px] uppercase tracking-widest text-[#6B6B6B] font-bold">Or</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => handleGoogleSignup('user')}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-black py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-500 group"
                    >
                        <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-4 h-4 group-hover:invert transition-all" alt="G" />
                        Signup with Google
                    </button>
                </div>

                {/* --- FOOTER LINKS SECTION --- */}
                <div className="mt-12 pt-8 border-t border-[#E6E0DA] space-y-6 text-center">
                    <div>
                        <p className="text-[10px] text-[#6B6B6B] uppercase tracking-[0.15em] font-medium">
                            Already have an account? <Link to="/login" className="text-[#1F1F1F] font-bold hover:text-[#C9653B] transition-colors ml-1">Login</Link>
                        </p>
                    </div>

                    {/* The "Become a Seller" CTA */}
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