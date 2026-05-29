import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Beaker, ArrowLeft, Sparkles, Zap, Music } from "lucide-react";
import { Link } from "react-router-dom";
import SongCard from "@/components/music/SongCard";
import PaymentModal from "@/components/music/PaymentModal";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type Song } from "@/lib/api";
import SEO from "@/components/SEO";

export default function Lab() {
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [buyingSong, setBuyingSong] = useState<Song | null>(null);

    useEffect(() => {
        api.getSongs()
            .then(allSongs => {
                // Specifically filter for the AI Laboratory tracks
                const labSongs = allSongs.filter(s => s.genre === "AI Laboratory");
                setSongs(labSongs);
            })
            .catch(() => setSongs([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary/30">
            <SEO 
                title="WachaAI Music Lab | Experimental Neural Audio Composites"
                description="Step into the WachaAI laboratory, exploring the boundary between machine learning and human audio composition. Experience neural-network generated beats and WAV stems."
                keywords="AI music lab, Suno AI Uganda, algorithmic compositions, neural network audio, WAV stems"
            />
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/5 rounded-full blur-[120px]" />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-white/5 bg-black/50 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/5"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <Beaker className="w-5 h-5 text-primary" />
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Experimental</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">AI Music Lab</h1>
                        </div>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-6">
                         <div className="flex items-center gap-2 text-xs text-white/40">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Powered by Suno AI</span>
                         </div>
                         <div className="h-4 w-px bg-white/10" />
                         <Link to="/store" className="text-sm font-medium text-white/60 hover:text-primary transition-colors">
                            Main Store
                         </Link>
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 md:py-20">
                {/* Intro Section */}
                <div className="max-w-3xl mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider mb-6"
                    >
                        <Zap className="w-3 h-3" />
                        New Venture
                    </motion.div>
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
                    >
                        Exploring the future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-400">sound.</span>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-white/50 leading-relaxed"
                    >
                        Welcome to the WachaAI Music Laboratory. All tracks featured here are 
                        experimental compositions generated using advanced neural networks. 
                        We push the boundaries of rhythm, melody, and AI-human collaboration.
                    </motion.p>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <Skeleton key={i} className="h-[400px] rounded-3xl bg-white/5 border border-white/5" />
                        ))}
                    </div>
                ) : songs.length === 0 ? (
                    <div className="text-center py-32 rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
                        <Music className="w-12 h-12 text-white/10 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-white/40">Lab is currently undergoing maintenance</h3>
                        <p className="text-white/20 mt-2">Experimental tracks are being recalibrated. Check back soon.</p>
                        <Link to="/store" className="inline-block mt-8 text-primary hover:underline italic">
                            Visit the main store in the meantime →
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {songs.map((song, i) => (
                            <SongCard
                                key={song.id}
                                song={song}
                                index={i}
                                onBuy={setBuyingSong}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Footer-ish Info */}
            <section className="relative z-10 max-w-6xl mx-auto px-6 pb-32">
                <div className="rounded-3xl p-8 md:p-12 bg-gradient-to-br from-primary/10 via-transparent to-violet-500/10 border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:32px_32px]" />
                    <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-2xl font-bold mb-4">Request a Custom Track?</h3>
                            <p className="text-white/50 mb-8 leading-relaxed">
                                Need a unique soundscape for your project? Our laboratory can synthesize 
                                custom stems and full compositions tailored to your specific requirements.
                            </p>
                            <Link 
                                to="/commission" 
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold text-sm hover:brightness-90 transition-all"
                            >
                                Start Collaboration
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "Engine", val: "Suno v3.5" },
                                { label: "Synthesis", val: "Neural" },
                                { label: "Region", val: "East Africa" },
                                { label: "Format", val: "WAV / STEMS" },
                            ].map((item, idx) => (
                                <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1">{item.label}</div>
                                    <div className="font-mono text-sm text-primary">{item.val}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {buyingSong && (
                <PaymentModal
                    song={buyingSong}
                    onClose={() => setBuyingSong(null)}
                />
            )}
        </div>
    );
}
