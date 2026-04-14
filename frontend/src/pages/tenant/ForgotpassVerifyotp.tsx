import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import authService from "../../services/auth.service";
import toast from "react-hot-toast";

const TenantForgotPassVerifyOtp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extracting data from navigation state (passed from TenantForgotPassPage)
  const email = location.state?.email || "";
  const role = location.state?.role || "tenant";
  const initialExpiry = location.state?.expiresAt;

  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      toast.error("Session expired. Please restart recovery.");
      navigate("/tenant/forgot-pass");
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
      const result = await authService.forgotpass({ email, role: 'tenant' }) as any;
      if (result && result.success) {
        const newExpiry = result.expiresAt
          ? new Date(result.expiresAt).getTime()
          : Date.now() + 120000;
        setExpiresAt(newExpiry);
        toast.success("New business recovery code sent.");
      }
    } catch (err) {
      toast.error("Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const otpString = otp.join("");

    try {
      const result = await authService.verifyOtp({
        email,
        otp: otpString,
        role: role as any,
        purpose: 'forgot_password'
      }) as any;

      if (result && result.success) {
        toast.success("Identity verified. Update your password.");
        navigate("/tenant/reset-password", {
          state: { email, role, resetToken: result.resetToken }
        });
      } else {
        toast.error(result.message || "Invalid business code");
      }
    } catch (err: any) {
      toast.error("Verification failed. Please try again.");
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
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FB] p-6 font-sans">
      <div className="max-w-md w-full bg-white border border-[#E2E8F0] p-10 rounded-2xl shadow-sm">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Security Verification</h2>
          <p className="text-[#475569] text-[11px] font-medium uppercase tracking-wider mt-3">
            Enter the 6-digit code sent to <br />
            <span className="text-[#2F6FED] font-bold lowercase">{email}</span>
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
                className="w-12 h-14 border border-[#E2E8F0] bg-[#FFFFFF] rounded-xl text-center text-xl font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2F6FED]/20 focus:border-[#2F6FED] transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.includes("") || timeLeft === 0}
            className="w-full bg-[#2F6FED] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#2557C8] transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? "Processing..." : "Verify and Continue"}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-[#E2E8F0] text-center">
          <p className="text-[11px] text-[#475569] font-medium uppercase tracking-widest mb-4">
            {timeLeft > 0 ? "Session remains active for" : "Your security code has expired"}
          </p>

          {timeLeft > 0 ? (
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#F1F5F9] text-[#2F6FED] text-xs font-bold">
              <span className="mr-2 h-2 w-2 rounded-full bg-[#2F6FED] animate-pulse"></span>
              {formatTime(timeLeft)}
            </div>
          ) : (
            <button
              onClick={handleResend}
              disabled={loading}
              className="text-xs font-extrabold uppercase tracking-widest text-[#2F6FED] hover:text-[#2557C8] transition-all disabled:opacity-50 underline underline-offset-4"
            >
              Request New Business Code
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantForgotPassVerifyOtp;