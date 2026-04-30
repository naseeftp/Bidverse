import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import authService from "../../services/auth.service";
import toast from "react-hot-toast";
import type { userRole } from "../../types/auth.type";

// 1. Define the specific shape of the data for this process
interface ForgotPassData {
  expiresAt: string;
  resetToken?: string;
}

// 2. Define a strict structure for the service response envelope
interface ServiceResponse {
  success: boolean;
  message: string;
  data?: ForgotPassData;
}

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const ForgotPassVerifyOtp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = (location.state?.email as string) || "";
  const role = (location.state?.role as userRole) || "user";
  const initialExpiry = location.state?.expiresAt as string | undefined;

  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      toast.error("Session expired. Please start again.");
      navigate("/forgot-pass");
      return;
    }

    if (initialExpiry) {
      setExpiresAt(new Date(initialExpiry).getTime());
    } else {
      setExpiresAt(Date.now() + 120000);
    }
  }, [email, navigate, initialExpiry]);

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
      if (calculateTime() <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
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
      
      const result = (await authService.forgotpass({
        email,
        role: "user",
      })) as ServiceResponse;

      if (result.success && result.data) {
        const newExpiry = new Date(result.data.expiresAt).getTime();
        setExpiresAt(newExpiry);
        toast.success("New recovery code sent.");
      }
    } catch (err: unknown) {
      const error = err as ApiErrorResponse;
      toast.error(error.response?.data?.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const otpString = otp.join("");

    try {
      // FIX: Assert the function's return type
      const result = (await authService.verifyOtp({
        email,
        otp: otpString,
        role: role,
        purpose: "forgot_password",
      })) as ServiceResponse;

      if (result.success && result.data) {
        toast.success("Email verified. Set your new password.");
        navigate("/reset-password", {
          state: {
            email,
            role,
            resetToken: result.data.resetToken,
          },
        });
      } else {
        toast.error(result.message || "Invalid recovery code");
      }
    } catch (err: unknown) {
      const error = err as ApiErrorResponse;
      toast.error(error.response?.data?.message || "Verification failed.");
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
    <div className="min-h-screen flex items-center justify-center bg-[#FFF9F4] p-4 font-sans text-[#1F1F1F]">
      <div className="max-w-md w-full bg-white border border-[#E6E0DA] p-10 shadow-sm">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold uppercase italic tracking-tighter">Identity Check</h2>
          <p className="text-[#6B6B6B] text-[10px] uppercase tracking-[0.2em] mt-2">
            Recovery code sent to <br /><span className="text-[#1F1F1F] font-bold">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-10">
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
                className="w-12 h-16 border border-[#E6E0DA] bg-[#FFF9F4] text-center text-xl font-bold focus:outline-none focus:border-[#C9653B] transition-colors"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.includes("") || (timeLeft === 0 && expiresAt !== null)}
            className="w-full bg-[#C9653B] text-white py-4 font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Recovery Code"}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-[#E6E0DA] text-center">
          <p className="text-[10px] text-[#6B6B6B] uppercase tracking-[0.15em] mb-3">
            {timeLeft > 0 ? "Recovery window active" : "Code has expired"}
          </p>

          {timeLeft > 0 ? (
            <span className={`text-[10px] font-bold uppercase italic ${timeLeft < 20 ? 'text-[#D98880]' : 'text-[#B37E27]'}`}>
              Ends in {formatTime(timeLeft)}
            </span>
          ) : (
            <button
              onClick={handleResend}
              type="button"
              disabled={loading}
              className="text-[11px] font-bold uppercase tracking-widest text-[#1F1F1F] border-b-2 border-[#C9653B] px-2 py-1 hover:bg-[#C9653B] hover:text-white transition-all disabled:opacity-50"
            >
              Get New Code
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassVerifyOtp;