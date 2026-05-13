import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import authService from "../../services/auth.service";
import type { ResetPasswordDTO } from "../../types/auth.type";
import toast from "react-hot-toast";
import { useAppSelector } from "../../hooks/redux.hooks";

const resetSchema = yup.object({
  email: yup.string().email().required(),
  resetToken: yup.string().required(),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
}).required();

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const { isAuthenticated } = useAppSelector((state) => state.auth)
 
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordDTO>({
    resolver: yupResolver(resetSchema),
    defaultValues: {
      email: email,
      resetToken: resetToken,
    },
  });

    useEffect(() => {
    const storedData = localStorage.getItem('verifyotpdata')


    if (!storedData) {
      toast.error("Unauthorized access. Please verify your identity first.");
      navigate("/forgot-pass");
      return
    }
    const parsedData = JSON.parse(storedData ?? '')
    setEmail(parsedData.email);
    setResetToken(parsedData.resetToken)
    setValue("email", parsedData.email);
    setValue("resetToken", parsedData.resetToken);
  }, [setValue, navigate]);

  const onSubmit = async (data: ResetPasswordDTO) => {
    setIsSubmitting(true);
    try {
      const result = await authService.resetPassword(data);

      if (result.success) {
        if (isAuthenticated) {
          toast.success("Your password changed");
          navigate('/profile')
        }
        else {
          toast.success(result.message || "Security credentials updated. Please login.");
          navigate("/login");
        }
        localStorage.removeItem('verifyotpdata')

      } else {
        toast.error(result.message || "Failed to reset password.");
      }
    } catch (err: unknown) {

      interface BackendError {
        response?: {
          data?: {
            message?: string;
          };
        };
      }


      const error = err as BackendError;
      const errorMessage = error.response?.data?.message || "Failed to reset password.";

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F4] flex items-center justify-center px-6 font-sans">
      <div className="bg-[#FFFFFF] border border-[#E6E0DA] w-full max-w-sm p-8 shadow-sm">

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#1F1F1F] uppercase tracking-tighter italic underline decoration-[#C9653B] decoration-2 underline-offset-4">
            New Password
          </h2>
          <p className="text-[#6B6B6B] text-[10px] uppercase tracking-[0.2em] mt-3">
            Account Recovery for <br />
            <span className="text-[#1F1F1F] font-bold">{email}</span>
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>


          <input type="hidden" {...register("email")} />
          <input type="hidden" {...register("resetToken")} />


          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B6B6B] mb-2">New Password</label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className={`w-full bg-[#FFF9F4] border ${errors.password ? 'border-red-500' : 'border-[#E6E0DA]'} px-4 py-3 text-sm text-[#1F1F1F] focus:outline-none focus:border-[#C9653B] transition-colors`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]"
              >
                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
            {errors.password && <p className="text-[#D98880] text-[10px] mt-1 uppercase font-bold">{errors.password.message}</p>}
          </div>


          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B6B6B] mb-2">Confirm Password</label>
            <div className="relative">
              <input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                className={`w-full bg-[#FFF9F4] border ${errors.confirmPassword ? 'border-red-500' : 'border-[#E6E0DA]'} px-4 py-3 text-sm text-[#1F1F1F] focus:outline-none focus:border-[#C9653B] transition-colors`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]"
              >
                {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-[#D98880] text-[10px] mt-1 uppercase font-bold">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#C9653B] text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#1F1F1F] transition-all duration-300 disabled:opacity-50"
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#E6E0DA] text-center">
          <Link to="/login" className="text-[10px] text-[#6B6B6B] uppercase tracking-[0.15em] font-medium hover:text-[#C9653B]">
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;