import React, { useState, useRef } from "react";
import { ArrowLeft, Zap, Video, Monitor, Film, Play, Pause, Volume2, VolumeX, Cpu, Activity, Database } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

// Cyberpunk Video Generator Room
export default function Cinematics() {
    const [character, setCharacter] = useState("@CyberDetective");
    const [shotPrompt, setShotPrompt] = useState("Cinematic medium tracking shot. Slow pan-right camera movement tracking past glowing neon alley signs under a heavy, torrential downpour. @CyberDetective is leaning against a dark brick wall. Water droplets realistically run down his leather coat. He holds a sharp, triangular neon-green data chip flat in his open palm.");
    const [cameraMovement, setCameraMovement] = useState("Medium tracking shot, slow pan-right");
    const [lighting, setLighting] = useState("High-contrast chiaroscuro, cinematic neon cyan and pink");
    
    const [status, setStatus] = useState<"idle" | "submitting" | "rendering" | "completed">("idle");
    const [progress, setProgress] = useState(0);
    const [logLines, setLogLines] = useState<string[]>([]);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    // Audio/Video player state
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);

    const logsTemplate = [
        "Initializing engine config (model: omni-multimodal-video, version: 2026-v2)",
        "Locking spatial constraints & fluid dynamics...",
        "Applying visual anchors for character context...",
        "Synthesizing ambient track (torrential rain downpour)...",
        "Rendering frame buffer sequences (1080p, 24fps)...",
        "Calculating chiaroscuro light reflection dynamics...",
        "Validating physics locking indexes...",
        "Assembling audio-video container payload...",
        "Finalizing cinematic render output..."
    ];

    const generateTrailer = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");
        setProgress(0);
        setLogLines(["Connecting to video generation pipeline..."]);

        try {
            const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3001/api" : "/api");
            const response = await fetch(`${apiBase}/video/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    characterAsset: character,
                    shotPrompt: `${shotPrompt}. Lighting: ${lighting}. Camera: ${cameraMovement}`,
                })
            });
            await response.json();

            setStatus("rendering");
            
            // Telemetry Simulator
            let currentStep = 0;
            const logInterval = setInterval(() => {
                if (currentStep < logsTemplate.length) {
                    setLogLines(prev => [...prev, `[TELEMETRY] ${logsTemplate[currentStep]}`]);
                    setProgress(Math.round(((currentStep + 1) / logsTemplate.length) * 100));
                    currentStep++;
                } else {
                    clearInterval(logInterval);
                    setStatus("completed");
                    setProgress(100);
                    // Use a high-quality futuristic demo video loop
                    setVideoUrl("https://assets.mixkit.co/videos/preview/mixkit-futuristic-subway-station-with-neon-lights-and-steamy-air-44015-large.mp4");
                }
            }, 600);

        } catch (error: any) {
            setLogLines(prev => [...prev, `[ERROR] Connection failed: ${error.message}`]);
            setStatus("idle");
        }
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play().catch(err => console.log("Play interrupted: ", err));
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30 overflow-x-hidden">
            <SEO 
                title="WachaAI Studio | Cinematic AI Video Generator"
                description="Experience the future of cinematic video synthesis. Customize cyberpunk environments, lock character assets, and render production-grade movie trailers instantly."
                keywords="AI video generator, Suno Uganda, cinematic video synthesis, cyberpunk video generator, Peter Wacha, WachaAI studio"
            />
            
            {/* Cyberpunk Grid Background */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[140px]" />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-white/5 bg-black/55 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/5"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <Film className="w-4 h-4 text-cyan-400" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400">Cinematic Engine</span>
                            </div>
                            <h1 className="text-xl md:text-2xl font-bold tracking-tight">WachaAI Video Studio</h1>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                         <div className="hidden md:flex items-center gap-2 text-xs text-white/40">
                            <Cpu className="w-3.5 h-3.5" />
                            <span>Omni-Multimodal v2</span>
                         </div>
                         <div className="h-4 w-px bg-white/10 hidden md:block" />
                         <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
                             ONLINE
                         </span>
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-12 gap-8 items-start">
                
                {/* Generation Control Panel (Left Column) */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
                        
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                            <Activity className="w-4 h-4 text-cyan-400" />
                            Render Parameters
                        </h2>

                        <form onSubmit={generateTrailer} className="space-y-5">
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-white/40 mb-2 font-mono">
                                    Character Anchor
                                </label>
                                <input
                                    type="text"
                                    value={character}
                                    onChange={(e) => setCharacter(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50 transition-colors font-mono"
                                    placeholder="@CharacterName"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider text-white/40 mb-2 font-mono">
                                    Camera Movement Preset
                                </label>
                                <select
                                    value={cameraMovement}
                                    onChange={(e) => setCameraMovement(e.target.value)}
                                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50 transition-colors"
                                >
                                    <option value="Medium tracking shot, slow pan-right">Medium tracking shot, slow pan-right</option>
                                    <option value="Low-angle static, dolly zoom out">Low-angle static, dolly zoom out</option>
                                    <option value="Handheld drone swoop down, quick focus shift">Handheld drone swoop down, quick focus shift</option>
                                    <option value="Extreme close-up macro, slide left">Extreme close-up macro, slide left</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider text-white/40 mb-2 font-mono">
                                    Lighting Style
                                </label>
                                <select
                                    value={lighting}
                                    onChange={(e) => setLighting(e.target.value)}
                                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50 transition-colors"
                                >
                                    <option value="High-contrast chiaroscuro, cinematic neon cyan and pink">High-contrast chiaroscuro, cinematic neon cyan and pink</option>
                                    <option value="Dystopian neon fog, overcast gloomy street haze">Dystopian neon fog, overcast gloomy street haze</option>
                                    <option value="Monochrome silhouette, flashing yellow hazard strobes">Monochrome silhouette, flashing yellow hazard strobes</option>
                                    <option value="Cybernetic gold backlight, sharp neon green highlights">Cybernetic gold backlight, sharp neon green highlights</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider text-white/40 mb-2 font-mono">
                                    Cinematic Shot Prompt
                                </label>
                                <textarea
                                    value={shotPrompt}
                                    onChange={(e) => setShotPrompt(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50 transition-colors h-28 resize-none leading-relaxed"
                                    placeholder="Describe the cinematic layout and actions..."
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status !== "idle"}
                                className="w-full py-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold uppercase text-xs tracking-widest transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Zap className="w-4 h-4 fill-current" />
                                {status === "idle" ? "Synthesize Trailer Clip" : "Rendering Asset..."}
                            </button>
                        </form>
                    </div>

                    {/* Presets Helper */}
                    <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-4 text-xs space-y-3">
                        <div className="text-white/40 font-mono uppercase tracking-wider">Example Anchor Presets</div>
                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                onClick={() => {
                                    setCharacter("@CyberDetective");
                                    setShotPrompt("Cinematic medium tracking shot. Slow pan-right camera movement tracking past glowing neon alley signs under a heavy, torrential downpour. @CyberDetective is leaning against a dark brick wall. Water droplets realistically run down his leather coat.");
                                }}
                                className="p-2.5 rounded-lg border border-white/5 hover:border-cyan-500/30 bg-white/[0.02] text-left transition-colors truncate"
                            >
                                🔍 Cyber Detective
                            </button>
                            <button 
                                onClick={() => {
                                    setCharacter("@NeoHacker");
                                    setShotPrompt("Close-up profile of @NeoHacker with transparent holographic UI visor reflecting green glowing terminal logs. Rapid finger keystrokes in background.");
                                }}
                                className="p-2.5 rounded-lg border border-white/5 hover:border-cyan-500/30 bg-white/[0.02] text-left transition-colors truncate"
                            >
                                💾 Neo Hacker
                            </button>
                        </div>
                    </div>
                </div>

                {/* Telemetry Log & Interactive Player Screen (Right Column) */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md relative overflow-hidden flex flex-col items-stretch min-h-[460px]">
                        
                        {/* Monitor Deck Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                            <div className="flex items-center gap-2">
                                <Monitor className="w-4 h-4 text-cyan-400" />
                                <span className="text-xs uppercase tracking-wider font-mono text-white/60">Cinematic Studio Feed</span>
                            </div>
                            {status === "rendering" && (
                                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 animate-pulse">
                                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                                    <span>Rendering {progress}%</span>
                                </div>
                            )}
                        </div>

                        {/* Player Frame */}
                        <div className="flex-1 flex flex-col justify-center items-center relative rounded-2xl overflow-hidden border border-white/5 bg-black/60 shadow-inner group aspect-video">
                            {status === "idle" && !videoUrl && (
                                <div className="text-center p-8">
                                    <Video className="w-12 h-12 text-white/20 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-white/50 mb-1">Visualizer Terminal Offline</h3>
                                    <p className="text-sm text-white/30 max-w-sm mx-auto">
                                        Configure parameters on the left pane and synthesize to render the cinematic output.
                                    </p>
                                </div>
                            )}

                            {(status === "submitting" || status === "rendering") && (
                                <div className="w-full h-full flex flex-col justify-center items-center p-8 bg-black/80 z-20">
                                    <div className="w-16 h-16 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin mb-4" />
                                    <div className="text-cyan-400 font-mono text-xs uppercase tracking-[0.2em] mb-2">Synthesizing Scene...</div>
                                    <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${progress}%` }} />
                                    </div>
                                </div>
                            )}

                            {videoUrl && status === "completed" && (
                                <div className="relative w-full h-full">
                                    <video
                                        ref={videoRef}
                                        src={videoUrl}
                                        loop
                                        muted={isMuted}
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Action bar overlays */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-6 z-30">
                                        <button
                                            onClick={togglePlay}
                                            className="p-3 rounded-full bg-cyan-400 text-black hover:scale-105 transition-transform"
                                        >
                                            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                                        </button>
                                        <button
                                            onClick={toggleMute}
                                            className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                                        >
                                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Telemetry Console Logs */}
                        <div className="mt-6 bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-[10px] text-cyan-400/80 h-36 overflow-y-auto space-y-1 scrollbar-thin">
                            <div className="text-white/40 border-b border-white/5 pb-1 mb-2 flex items-center justify-between">
                                <span>Engine Telemetry Logs</span>
                                <Database className="w-3 h-3 text-white/30" />
                            </div>
                            {logLines.length === 0 ? (
                                <div className="text-white/20">Waiting for generation trigger...</div>
                            ) : (
                                logLines.map((line, idx) => (
                                    <div key={idx} className="leading-relaxed">
                                        {line}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
