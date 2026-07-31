import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Mic } from "lucide-react";

interface AudioPlayerProps {
  src: string;
  isSelf: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, isSelf }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds === 0) return "0:00";
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 w-60 py-1">
      <audio ref={audioRef} src={src} preload="metadata" />

  
      <button
        onClick={togglePlay}
        type="button"
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-95 ${
          isSelf
            ? "bg-white text-[#1F1F1F] hover:bg-white/90"
            : "bg-[#1F1F1F] text-white hover:bg-[#1F1F1F]/90"
        }`}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
      </button>

  
      <div className="flex-1 flex flex-col gap-1 justify-center">
       
        <div className="relative w-full h-1.5 rounded-full bg-black/10 overflow-hidden flex items-center">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
          />
          <div
            className={`h-full rounded-full transition-all duration-75 ${
              isSelf ? "bg-white" : "bg-[#1F1F1F]"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
          <div className="flex items-center justify-between text-[10px] font-mono opacity-70">
          <span>{isPlaying ? formatTime(currentTime) : formatTime(duration)}</span>
          <Mic className="w-3 h-3 opacity-60" />
        </div>
      </div>
    </div>
  );
};