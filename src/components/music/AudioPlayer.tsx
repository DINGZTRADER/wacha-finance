import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

type Props = {
    src: string;
    title: string;
    artist: string;
    onEnded?: () => void;
};

export default function AudioPlayer({ src, title, artist, onEnded }: Props) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onLoaded = () => {
            setDuration(audio.duration);
            setLoading(false);
        };
        const onTime = () => setCurrentTime(audio.currentTime);
        const onEnd = () => {
            setPlaying(false);
            onEnded?.();
        };

        const onError = () => {
            setLoading(false);
            console.error(`Failed to load audio: ${src}`);
        };

        audio.addEventListener("loadedmetadata", onLoaded);
        audio.addEventListener("timeupdate", onTime);
        audio.addEventListener("ended", onEnd);
        audio.addEventListener("error", onError);

        return () => {
            audio.removeEventListener("loadedmetadata", onLoaded);
            audio.removeEventListener("timeupdate", onTime);
            audio.removeEventListener("ended", onEnd);
            audio.removeEventListener("error", onError);
        };
    }, [onEnded, src]);

    const toggle = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (playing) {
            audio.pause();
        } else {
            audio.play();
        }
        setPlaying(!playing);
    }, [playing]);

    const seek = (e: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current;
        if (!audio || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pct * duration;
    };

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, "0")}`;
    };

    const progress = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div className="rounded-xl bg-card/60 border border-border p-4">
            <audio ref={audioRef} src={src} preload="metadata" />

            <div className="flex items-center gap-3">
                {/* Play/Pause */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={toggle}
                    disabled={loading}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground hover:brightness-110 transition-all disabled:opacity-50 shrink-0"
                    aria-label={playing ? "Pause" : "Play"}
                >
                    {playing ? (
                        <Pause className="w-4 h-4" />
                    ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                    )}
                </motion.button>

                {/* Track info + progress */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                        <div className="truncate">
                            <span className="text-sm font-medium">{title}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                                {artist}
                            </span>
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums shrink-0 ml-2">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div
                        className="h-1.5 bg-muted rounded-full cursor-pointer group relative"
                        onClick={seek}
                    >
                        <motion.div
                            className="h-full bg-primary rounded-full relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                    </div>
                </div>

                {/* Volume */}
                <button
                    onClick={() => {
                        if (audioRef.current) audioRef.current.muted = !muted;
                        setMuted(!muted);
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    aria-label={muted ? "Unmute" : "Mute"}
                >
                    {muted ? (
                        <VolumeX className="w-4 h-4" />
                    ) : (
                        <Volume2 className="w-4 h-4" />
                    )}
                </button>
            </div>
        </div>
    );
}
