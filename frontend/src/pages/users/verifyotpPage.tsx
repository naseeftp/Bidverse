import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux.hooks";
import { setAuthSuccess } from "../../redux/user/auth.slice";
import authService from "../../services/auth.service";
import toast from "react-hot-toast";
const VerifyOtpPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const tempAuthData = useAppSelector((state) => state.auth.tempAuthData);
  const email = location.state?.email || tempAuthData?.email || "";
  const initialExpiry = location.state?.expiresAt;
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);


  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);


  useEffect(() => {
    if (!email) {
      navigate("/register");
      return
    }

    if (initialExpiry) {
      setExpiresAt(new Date(initialExpiry).getTime());
    }
    else if (!expiresAt) {
      setExpiresAt(Date.now() + 60000);
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

    const initialDiff = calculateTime();
    if (initialDiff <= 0) return;

    const interval = setInterval(() => {
      const currentDiff = calculateTime();
      if (currentDiff <= 0) {
        clearInterval(interval);
      }
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
      const result = await authService.resendOtp({ email }) as any;
      if (result && result.success) {
        if (result.expiresAt) {
          setExpiresAt(new Date(result.expiresAt).getTime());
        }
        else {
          setExpiresAt(Date.now() + 60000);
        }
        toast.success(result.message)
      } else {
        toast.error(result.message || 'Failed to resend otp')
      }

    } catch (err) {
      toast.error("An error occurred while resending OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);

    const role = tempAuthData?.role || 'user';
    const otpString = otp.join("");

    try {
      const result = await authService.verifyOtp({
        email,
        otp: otpString,
        role: role as any
      }) as any;

      if (result && result.success) {
        localStorage.setItem("accessToken", result.token);
        dispatch(setAuthSuccess(result.user));
        toast.success(result.message)
        navigate("/user-home");
      } else {
        // setLocalError(result?.message || "Invalid Code");
        toast.error(result.message || "invalid code")

      }
    } catch (err: any) {
      // setLocalError("Verification failed.");
      toast.error("Vergication filed")
    } finally {
      setLoading(false);
    }
  };


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60; setLocalError
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF9F4] p-4 font-sans">
      <div className="max-w-md w-full bg-white border border-[#E6E0DA] p-10 shadow-sm">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#1F1F1F] uppercase italic tracking-tighter">Confirm Entry</h2>
          <p className="text-[#6B6B6B] text-[10px] uppercase tracking-[0.2em] mt-2">
            Verification sent to <span className="text-[#1F1F1F] font-bold">{email}</span>
          </p>
        </div>

        {localError && (
          <div className="mb-6 p-3 bg-[#D98880]/10 border border-[#D98880] text-[#D98880] text-[10px] font-bold uppercase text-center">
            {localError}
          </div>
        )}

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
                className="w-12 h-16 border border-[#E6E0DA] bg-[#FFF9F4] text-center text-xl font-bold text-[#1F1F1F] focus:outline-none focus:border-[#C9653B] transition-colors"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.includes("") || timeLeft === 0}
            className="w-full bg-[#C9653B] text-white py-4 font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? "Processing..." : "Validate Token"}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-[#E6E0DA] text-center">
          <p className="text-[10px] text-[#6B6B6B] uppercase tracking-[0.15em] mb-3">
            {timeLeft > 0 ? "Code is active" : "Code has expired"}
          </p>

          {timeLeft > 0 ? (
            <span className={`text-[10px] font-bold uppercase italic ${timeLeft < 15 ? 'text-[#D98880]' : 'text-[#B37E27]'}`}>
              Expires in {formatTime(timeLeft)}
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={loading}
              className="text-[11px] font-bold uppercase tracking-widest text-[#1F1F1F] border-b-2 border-[#C9653B] px-2 py-1 hover:bg-[#C9653B] hover:text-white transition-all disabled:opacity-50"
            >
              Request New OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;