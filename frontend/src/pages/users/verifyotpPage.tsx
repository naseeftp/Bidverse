import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux.hooks";
import { setAuthSuccess } from "../../redux/user/auth.slice";
import authService from "../../services/auth.service";
import toast from "react-hot-toast";
import type { ApiResponse, JwtPayload, VerifyOtpDTO } from "../../types/auth.type";

// Define the expected response for a successful registration verification
interface RegistrationResponse {
  token: string;
  user: JwtPayload;
}

interface AxiosError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const VerifyOtpPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const tempAuthData = useAppSelector((state) => state.auth.tempAuthData);


  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [email, setEmail] = useState('');;
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const storedData = localStorage.getItem('registrationData')
    if (!storedData) {
      navigate("/register");
      return;
    }
    const parsedData = JSON.parse(storedData)
    setEmail(parsedData.email);
    setExpiresAt(new Date(parsedData.expiresAt).getTime())
  }, [navigate]);

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

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  const handleResend = async () => {
    if (timeLeft > 0) {
      return
    }
    try {
      const result = await authService.resendOtp({ email });
      if (result.success && result.data) {
        const newExpiry = new Date(result.data.expiresAt).getTime()
        setExpiresAt(newExpiry);
        localStorage.setItem('registrationData', JSON.stringify({ email, expiresAt: result.data.expiresAt }))
        toast.success(result.message)
        setOtp(new Array(6).fill(''))
      }
      else {
        toast.error(result.message)
      }
    } catch {
      toast.error('Error in resending otp')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);


    const payload: VerifyOtpDTO = {
      email,
      otp: otp.join(""),
      role: tempAuthData?.role || 'user',
      purpose: 'registration'
    };

    try {
      const result: ApiResponse<RegistrationResponse> = await authService.verifyOtp(payload);

      if (result?.success && result.data) {
        localStorage.setItem("accessToken", result.data.token);
        dispatch(setAuthSuccess(result.data.user));
        toast.success(result.message);
        localStorage.removeItem('registrationData')
        navigate("/home");
      } else {
        toast.error(result.message || "Invalid code");
      }
    } catch (err: unknown) {
      const error = err as AxiosError;
      toast.error(error.response?.data?.message || "Verification failed");
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
    <div className="min-h-screen flex items-center justify-center bg-[#FFF9F4] p-4 font-sans">
      <div className="max-w-md w-full bg-white border border-[#E6E0DA] p-10 shadow-sm">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#1F1F1F] uppercase italic tracking-tighter">Confirm Entry</h2>
          <p className="text-[#6B6B6B] text-[10px] uppercase tracking-[0.2em] mt-2">
            Verification sent to <span className="text-[#1F1F1F] font-bold">{email}</span>
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
            <div className="space-y-2">
              <p className="text-[10px] text-[#6B6B6B] uppercase tracking-[0.15em]">Didn't receive the code?</p>
              <button
                onClick={handleResend}
                type="button"
                className="text-[11px] font-bold uppercase tracking-widest border-b-2 border-[#C9653B] text-[#1F1F1F] hover:bg-[#C9653B] hover:text-white hover:border-transparent px-2 py-1 transition-all"
              >
                Resend New Code
              </button>
            </div>

          )

          }
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;