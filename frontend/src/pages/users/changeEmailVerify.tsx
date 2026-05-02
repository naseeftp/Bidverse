import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import profileService from "../../services/profileManagement.service";


const ChangeEmailVerifyPage: React.FC = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [expiresAt, setExpiresAt] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(false);

    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const storedData = localStorage.getItem("changeEmailVerificationData");

        if (!storedData) {
            toast.error("Verification session expired");
            navigate("/change-email");
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

            const difference = Math.max(
                0,
                Math.floor((expiresAt - now) / 1000)
            );

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
        try {
            const result = await profileService.changeEmailResendOtp({email})
            if (result.success && result.data) {
                const newExpiry = new Date(result.data.expiresAt).getTime();
                setExpiresAt(newExpiry);
                localStorage.setItem(
                    "changeEmailVerificationData",
                    JSON.stringify({
                        email,
                        expiresAt: result.data.expiresAt
                    })
                )
                setOtp(new Array(6).fill(""));
                toast.success(result.message)
            }
            else {
                toast.error(result.message)
            }
        } catch {
            toast.error('Error in resending otp')
        }
    }
    const handleChange = (value: string, index: number) => {
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];

        newOtp[index] = value.substring(value.length - 1);

        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        index: number
    ) => {
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
                localStorage.removeItem("changeEmailVerificationData");
                navigate("/profile");
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
        <div className="min-h-screen flex items-center justify-center bg-[#FFF9F4] p-4 font-sans">
            <div className="max-w-md w-full bg-white border border-[#E6E0DA] p-10 shadow-sm">

                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-[#1F1F1F] uppercase italic tracking-tighter">
                        Verify Email
                    </h2>

                    <p className="text-[#6B6B6B] text-[10px] uppercase tracking-[0.2em] mt-2">
                        OTP sent to{" "}
                        <span className="text-[#1F1F1F] font-bold">
                            {email}
                        </span>
                    </p>
                </div>

                <form
                    onSubmit={handleVerify}
                    className="space-y-10"
                >
                    <div className="flex justify-between gap-2">
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                ref={(el) => {
                                    inputRefs.current[index] = el;
                                }}
                                type="text"
                                maxLength={1}
                                value={data}
                                onChange={(e) =>
                                    handleChange(e.target.value, index)
                                }
                                onKeyDown={(e) =>
                                    handleKeyDown(e, index)
                                }
                                className="w-12 h-16 border border-[#E6E0DA] bg-[#FFF9F4] text-center text-xl font-bold text-[#1F1F1F] focus:outline-none focus:border-[#C9653B] transition-colors"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={
                            loading ||
                            otp.includes("") ||
                            timeLeft === 0
                        }
                        className="w-full bg-[#C9653B] text-white py-4 font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
                    >
                        {loading
                            ? "Processing..."
                            : "Verify OTP"}
                    </button>
                </form>

                <div className="mt-12 pt-8 border-t border-[#E6E0DA] text-center">
                    <p className="text-[10px] text-[#6B6B6B] uppercase tracking-[0.15em] mb-3">
                        {timeLeft > 0
                            ? "Code is active"
                            : "Code has expired"}
                    </p>

                    {timeLeft > 0 ? (
                        <span
                            className={`text-[10px] font-bold uppercase italic ${timeLeft < 15
                                    ? "text-[#D98880]"
                                    : "text-[#B37E27]"
                                }`}
                        >
                            Expires in {formatTime(timeLeft)}
                        </span>
                    ) : (
                        <button
                            onClick={handleResend}
                            type="button"
                            disabled={loading}
                            className="text-[11px] font-bold uppercase tracking-widest text-[#1F1F1F] border-b-2 border-[#C9653B] px-2 py-1 hover:bg-[#C9653B] hover:text-white transition-all disabled:opacity-50"
                        >
                            Resend OTP
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChangeEmailVerifyPage;