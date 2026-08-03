import React, { useState, useEffect, useCallback } from "react";
import { FaClock } from "react-icons/fa";

interface CountdownTimerProps {
    endTime: string | Date;
    onEnd?: () => void;
    className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
    endTime, 
    onEnd,
    className = "" 
}) => {
    const calculateTimeLeft = useCallback(() => {
        const difference = +new Date(endTime) - +new Date();
        if (difference <= 0) return null;

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
        };
    }, [endTime]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            const calculated = calculateTimeLeft();
            setTimeLeft(calculated);
            if (!calculated && onEnd) {
                onEnd();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [calculateTimeLeft, onEnd]);

    if (!timeLeft) {
        return (
            <span className="text-rose-600 font-bold uppercase text-[10px] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Auction Ended
            </span>
        );
    }

    const { days, hours, minutes, seconds } = timeLeft;

    return (
        <span className={`font-mono font-bold text-[#C9653B] flex items-center gap-1 ${className}`}>
            <FaClock size={10} className="animate-pulse" />
            {days > 0 && `${days}d `}
            {String(hours).padStart(2, "0")}h {String(minutes).padStart(2, "0")}m {String(seconds).padStart(2, "0")}s
        </span>
    );
};

export default CountdownTimer;