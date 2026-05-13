import React, { useState, useEffect } from "react";
import { Link,useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import authService from "../../services/auth.service";
import type { ResetPasswordDTO } from "../../types/auth.type";
import toast from "react-hot-toast";
import { useAppSelector } from "../../hooks/redux.hooks";


interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const resetSchema = yup.object({
  email: yup.string().email().required(),
  resetToken: yup.string().required(),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
}).required();

const TenantResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  // const email = location.state?.email || "";
  // const resetToken = location.state?.resetToken || "";
  

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email,setEmail]=useState('');
  const [resetToken,setResetToken]=useState('')

  useEffect(() => {
    const storedData=localStorage.getItem('verifyotpdata')
    
    if (!storedData) {
      toast.error("Unauthorized. Please verify your business email first.");
      navigate("/tenant/forgot-pass");
    }
     const parsedData=JSON.parse(storedData??'')
     setEmail(parsedData.email);
     setResetToken(parsedData.resetToken)
     setValue("email", parsedData.email);
     setValue("resetToken", parsedData.resetToken);
  }, [resetToken, email, navigate]);

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

  const onSubmit = async (data: ResetPasswordDTO) => {
    setIsSubmitting(true);
    try {
      const result = await authService.resetPassword({ ...data });
      if (result.success) {
        if (isAuthenticated) {
          toast.success("Auction House credentials updated");
          navigate("/tenant/profile");
        }
        else {
          toast.success("Auction House credentials updated. Please login.");
          navigate("/tenant/login");
        }
        localStorage.removeItem('verifyotpdata')
      }

    } catch (err: unknown) {
      const error = err as AxiosErrorResponse;
      toast.error(error.response?.data?.message || "Failed to update password.");
    } finally {
      setIsSubmitting(false);
      
    }
  };

  const inputStyle = "w-full bg-[#FFFFFF] border border-[#E2E8F0] px-4 py-3 rounded-xl text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#2F6FED]/20 focus:border-[#2F6FED] transition-all placeholder:text-[#94A3B8]";
  const labelStyle = "block text-[11px] font-bold uppercase tracking-widest text-[#475569] mb-2";

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center px-6 font-sans">
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] w-full max-w-sm p-10 rounded-3xl shadow-sm">

        <div className="text-center mb-10">
          <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Update Credentials
          </h2>
          <p className="text-[#475569] text-[11px] font-medium uppercase tracking-wider mt-3">
            Secure access for <br />
            <span className="text-[#2F6FED] font-bold lowercase">{email}</span>
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>

          <input type="hidden" {...register("email")} />
          <input type="hidden" {...register("resetToken")} />


          <div>
            <label className={labelStyle}>New Business Password</label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className={`${inputStyle} ${errors.password ? 'border-red-500' : ''}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#2F6FED] transition-colors"
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.password.message}</p>}
          </div>


          <div>
            <label className={labelStyle}>Confirm New Password</label>
            <div className="relative">
              <input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                className={`${inputStyle} ${errors.confirmPassword ? 'border-red-500' : ''}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#2F6FED] transition-colors"
              >
                {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#2F6FED] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#2557C8] transition-all shadow-md shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
          >
            {isSubmitting ? "Processing..." : "Secure Account"}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-[#E2E8F0] text-center">
          {isAuthenticated ?
            (
              <Link
                to="/tenant/profile"
                className="text-[11px] text-[#475569] font-bold uppercase tracking-widest hover:text-[#2F6FED] transition-colors"
              >
                Back to Profile
              </Link>
            ) : (

              <Link
                to="/tenant/login"
                className="text-[11px] text-[#475569] font-bold uppercase tracking-widest hover:text-[#2F6FED] transition-colors"
              >
                Back to Merchant Login
              </Link>
            )}

        </div>
      </div>
    </div>
  );
};

export default TenantResetPasswordPage;