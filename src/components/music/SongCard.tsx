import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Music, ShoppingCart } from "lucide-react";
import AudioPlayer from "./AudioPlayer";
import type { Song } from "@/lib/api";
import { api } from "@/lib/api";

type Props = {
    song: Song;
    onBuy: (song: Song) => void;
    index: number;
};

export default function SongCard({ song, onBuy, index }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-40px" });
    const coverUrl = api.getCoverUrl(song.cover_art);
    const previewUrl = api.getPreviewUrl(song.id);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className="group rounded-2xl border border-border bg-card/40 overflow-hidden hover:border-primary/25 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(56,189,248,0.06)]"
        >
            {/* Cover art */}
            <div className="relative aspect-square bg-muted overflow-hidden">
                {coverUrl ? (
                    <img
                        src={coverUrl}
                        alt={song.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-violet-500/10">
                        <Music className="w-16 h-16 text-primary/30" />
                    </div>
                )}

                {/* Genre badge */}
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-medium uppercase tracking-wider text-white/80">
                    {song.genre}
                </span>
            </div>

            {/* Info */}
            <div className="p-5 space-y-4">
                <div>
                    <h3 className="text-lg font-semibold truncate">
                        {song.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{song.artist}</p>
                </div>

                {/* Audio player */}
                <AudioPlayer
                    src={previewUrl}
                    title={song.title}
                    artist={song.artist}
                />

                {/* Price + Buy */}
                <div className="flex items-center justify-between pt-1">
                    <div>
                        <span className="text-xl font-bold text-primary">
                            UGX {song.price.toLocaleString()}
                        </span>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onBuy(song)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Buy
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
