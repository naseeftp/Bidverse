import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaShieldAlt, FaSyncAlt } from "react-icons/fa";
import profileService from '../../services/profileManagement.service'

const TenantVerifyEmailPage: React.FC = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [expiresAt, setExpiresAt] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const storedData = localStorage.getItem("tenantEmailVerification");

        if (!storedData) {
            toast.error("Verification session expired");
            navigate("/tenant/change-email");
            return;
        }

        const parsedData = JSON.parse(storedData);
        setEmail(parsedData.email);
        setExpiresAt(new Date(parsedData.expiresAt).getTime());
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
            if (calculateTime() <= 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expiresAt]);

    const handleResend = async () => {
        setLoading(true);
        try {
            const result = await profileService.changeEmailResendOtp({ email });
            if (result.success && result.data) {
                const newExpiry = new Date(result.data.expiresAt).getTime();
                setExpiresAt(newExpiry);
                localStorage.setItem(
                    "tenantEmailVerification",
                    JSON.stringify({ email, expiresAt: result.data.expiresAt })
                );
                setOtp(new Array(6).fill(""));
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error('Error resending OTP');
        } finally {
            setLoading(false);
        }
    };

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

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await profileService.changeEmailVerification({
                email,
                otp: otp.join(""),
            });

            if (result.success) {
                toast.success(result.message);
                localStorage.removeItem("tenantEmailVerification");
                navigate("/tenant/profile");
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("OTP verification failed");
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F7FB] p-6 font-sans">
            <div className="max-w-md w-full bg-white border border-[#E2E8F0] p-10 shadow-sm rounded-xl">
                
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-[#2F6FED10] text-[#2F6FED] rounded-full mb-4">
                        <FaShieldAlt size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
                        Security Verification
                    </h2>
                    <p className="text-[#475569] text-sm mt-3">
                        Enter the 6-digit code sent to <br />
                        <span className="text-[#0F172A] font-semibold">{email}</span>
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
                                className={`w-12 h-14 border ${data ? 'border-[#2F6FED] ring-2 ring-[#2F6FED10]' : 'border-[#E2E8F0]'} bg-white text-center text-xl font-bold text-[#0F172A] rounded-lg focus:outline-none focus:border-[#2F6FED] focus:ring-2 focus:ring-[#2F6FED20] transition-all`}
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otp.includes("") || timeLeft === 0}
                        className="w-full bg-[#2F6FED] text-white py-4 rounded-lg font-semibold shadow-md shadow-blue-100 hover:bg-[#1E5AD1] transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {loading ? "Verifying..." : "Confirm Verification"}
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-[#F1F5F9] text-center">
                    <div className="flex flex-col items-center gap-2">
                        {timeLeft > 0 ? (
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-[#475569]">Code expires in</span>
                                <span className={`font-mono font-bold ${timeLeft < 30 ? 'text-red-500' : 'text-[#2F6FED]'}`}>
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <p className="text-sm text-amber-600 font-medium italic">Code has expired</p>
                                <button
                                    onClick={handleResend}
                                    type="button"
                                    disabled={loading}
                                    className="flex items-center gap-2 text-sm font-bold text-[#2F6FED] hover:text-[#1E5AD1] transition-colors"
                                >
                                    <FaSyncAlt size={12} className={loading ? 'animate-spin' : ''} />
                                    Resend Verification Code
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-xs text-[#94A3B8] hover:text-[#475569] transition-colors"
                    >
                        Cancel and Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TenantVerifyEmailPage;