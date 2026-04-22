import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux.hooks";
import { setAuthSuccess } from "../../redux/user/auth.slice";
import authService from "../../services/auth.service";
import toast from "react-hot-toast";
import type { ApiResponse, JwtPayload } from '../../types/auth.type';

// Local interfaces for strict typing
// We omit 'exp' because the frontend state doesn't need the token expiry timestamp in the user object
interface RegistrationResult {
  token: string;
  user:JwtPayload 
}

interface ResendResult {
  expiresAt: string;
}

interface AxiosError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const TenantVerifyOtpPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const tempAuthData = useAppSelector((state) => state.auth.tempAuthData);
  const email = location.state?.email || tempAuthData?.email || "";
  const initialExpiry = location.state?.expiresAt;
  
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Theme Constants
  const brandBlue = "#2F6FED";
  const deepNavy = "#0F172A";
  const slateGrey = "#475569";
  const bgLight = "#F5F7FB";

  useEffect(() => {
    if (!email) {
      navigate("/tenant/register");
      return;
    }

    if (initialExpiry) {
      setExpiresAt(new Date(initialExpiry).getTime());
    } else if (!expiresAt) {
      setExpiresAt(Date.now() + 60000);
    }
  }, [email, navigate, initialExpiry, expiresAt]);

  useEffect(() => {
    if (!expiresAt) return;

    const calculateTime = () => {
      const now = Date.now();
      const difference = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeLeft(difference);
      return difference;
    };

    calculateTime();
    const interval = setInterval(() => {
      const currentDiff = calculateTime();
      if (currentDiff <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0) return;
    setLoading(true);

    try {
      const result: ApiResponse<ResendResult> = await authService.resendOtp({ email });
      if (result?.success) {
        setExpiresAt(result.data?.expiresAt ? new Date(result.data.expiresAt).getTime() : Date.now() + 60000);
        toast.success("New code sent to your email");
      } else {
        toast.error(result.message || 'Failed to resend OTP');
      }
    } catch (err: unknown) {
      const error = err as AxiosError;
      toast.error(error.response?.data?.message || "An error occurred while resending OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const role = tempAuthData?.role || 'tenant';
    const otpString = otp.join("");

    try {
      const result: ApiResponse<RegistrationResult> = await authService.verifyOtp({
        email,
        otp: otpString,
        role: role 
      });

      if (result?.success && result.data) {
        localStorage.setItem("accessToken", result.data.token);
        dispatch(setAuthSuccess(result.data.user));
        toast.success("Account Verified Successfully");
        navigate("/tenant/dashboard");
      } else {
        toast.error(result.message || "Invalid verification code");
      }
    } catch (err: unknown) {
      const error = err as AxiosError;
      toast.error(error.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-[${bgLight}] p-6 font-sans`}>
      <div className="max-w-md w-full bg-white border border-[#E2E8F0] p-10 md:p-12 rounded-2xl shadow-sm">
        
        <div className="text-center mb-10">
          <h2 className={`text-3xl font-extrabold text-[${deepNavy}] tracking-tight`}>
            Verify your House
          </h2>
          <p className={`text-[${slateGrey}] text-sm mt-3 font-medium`}>
            We&apos;ve sent a 6-digit code to <br />
            <span className={`text-[${deepNavy}] font-bold`}>{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-8">
          <div className="flex justify-between gap-2">
            {otp.map((data, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                maxLength={1}
                value={data}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`w-12 h-14 border border-[#E2E8F0] bg-[#FFFFFF] rounded-xl text-center text-xl font-bold text-[${deepNavy}] focus:outline-none focus:ring-2 focus:ring-[${brandBlue}]/20 focus:border-[${brandBlue}] transition-all`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.includes("") || timeLeft === 0}
            className={`w-full bg-[${brandBlue}] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#2557C8] transition-all shadow-md shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none`}
          >
            {loading ? "Verifying..." : "Confirm Verification"}
          </button>
        </form> 

        <div className="mt-10 pt-8 border-t border-[#E2E8F0] text-center">
          <p className={`text-[11px] font-semibold uppercase tracking-wider text-[${slateGrey}] mb-3`}>
            {timeLeft > 0 ? "Code expires in" : "Code has expired"}
          </p>

          {timeLeft > 0 ? (
            <span className={`text-lg font-mono font-bold ${timeLeft < 15 ? 'text-red-500' : `text-[${brandBlue}]`}`}>
              {formatTime(timeLeft)}
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={loading}
              className={`text-sm font-bold text-[${brandBlue}] hover:underline transition-all disabled:opacity-50`}
            >
              Resend Verification Code
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantVerifyOtpPage;