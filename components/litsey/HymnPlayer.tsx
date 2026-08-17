'use client';

import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

function formatTime(seconds: number): string {
    if (!Number.isFinite(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Програвач гімну. Якщо файл не завантажився, кнопка просто зникає —
 * краще нічого, ніж мертва кнопка посеред сторінки.
 */
export default function HymnPlayer({ src }: { src: string }) {
    const audioRef = useRef<HTMLAudioElement>(null);

    const [playing, setPlaying] = useState(false);
    const [current, setCurrent] = useState(0);
    const [duration, setDuration] = useState(0);
    const [broken, setBroken] = useState(false);

    if (broken) return null;

    const percent = duration > 0 ? (current / duration) * 100 : 0;

    function toggle() {
        const audio = audioRef.current;
        if (!audio) return;

        if (audio.paused) {
            audio.play().catch(() => setBroken(true));
        } else {
            audio.pause();
        }
    }

    function seek(event: React.MouseEvent<HTMLButtonElement>) {
        const audio = audioRef.current;
        if (!audio || !duration) return;

        const bar = event.currentTarget.getBoundingClientRect();
        const share = (event.clientX - bar.left) / bar.width;
        audio.currentTime = Math.min(Math.max(share, 0), 1) * duration;
    }

    return (
        <div className="flex items-center gap-4 rounded-2xl bg-background/10 border border-background/15 px-4 py-3">
            <button
                onClick={toggle}
                aria-label={playing ? "Пауза" : "Прослухати гімн"}
                className="w-11 h-11 shrink-0 rounded-full bg-cream text-primary flex items-center justify-center hover:bg-cream/85 active:scale-95 transition-all"
            >
                {playing ? (
                    <Pause size={18} fill="currentColor" />
                ) : (
                    <Play size={18} fill="currentColor" className="ml-0.5" />
                )}
            </button>

            <div className="min-w-0 flex-1">
                <p className="font-manrope text-xs font-semibold uppercase tracking-[0.14em] text-cream/80 mb-2">
                    {playing ? "Звучить гімн" : "Прослухати гімн"}
                </p>

                <button
                    onClick={seek}
                    aria-label="Перемотати"
                    className="group block w-full h-2 rounded-full bg-background/20 overflow-hidden cursor-pointer"
                >
                    <span
                        className="block h-full rounded-full bg-cream transition-[width] duration-200"
                        style={{ width: `${percent}%` }}
                    />
                </button>
            </div>

            <span className="shrink-0 font-inter text-xs tabular-nums text-background/60">
                {formatTime(current)} / {formatTime(duration)}
            </span>

            <audio
                ref={audioRef}
                src={src}
                preload="metadata"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
                onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onError={() => setBroken(true)}
            />
        </div>
    );
}
