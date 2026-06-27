import { useState, useEffect, useRef, useCallback } from "react";
import type { ReactNode, ElementType } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import {
    ArrowUpRight,
    Star,
    Users,
    Sparkles,
    Code2,
    Cpu,
    MapPin,
    Award,
    Github,
    Zap,
    Target,
    Layers,
    Rocket,
    Mail,
    ExternalLink,
    ChevronDown,
    Menu,
    X,
    Music,
    Mic2,
    Download,
    Phone,
    Film,
    Play,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import SEO from "@/components/SEO";
import CaseStudies from "@/components/CaseStudies";
import Clients from "@/components/Clients";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
type GitHubRepo = {
    id: number;
    name: string;
    description: string | null;
    html_url: string;
    stargazers_count: number;
    language: string | null;
    fork: boolean;
};

/* ------------------------------------------------------------------ */
/* Static data                                                         */
/* ------------------------------------------------------------------ */
const NAV_LINKS = [
    { label: "Products", href: "#products" },
    { label: "Case Studies", href: "#cases" },
    { label: "Open Source", href: "#opensource" },
    { label: "Process", href: "#process" },
    { label: "Credentials", href: "#certifications" },
    { label: "About", href: "#about" },
] as const;

const MUSIC_LINKS = [
    { label: "Music Store", href: "/store", icon: Music },
    { label: "AI Lab", href: "/lab", icon: Sparkles },
    { label: "AI Video Studio", href: "/cinematics", icon: Film },
    { label: "Commission", href: "/commission", icon: Mic2 },
] as const;

const STATS = [
    { value: "4+", label: "Active Products" },
    { value: "6+", label: "Open Source Repos" },
    { value: "2", label: "Google Certs" },
    { value: "UG", label: "Built in Uganda" },
] as const;

const PRODUCTS: {
    name: string;
    description: string;
    icon: ElementType;
    color: string;
    href?: string;
}[] = [
    {
        name: "WachaAI Video Studio",
        description:
            "Create high-impact, physics-locked cinematic cyberpunk video trailers with character anchors.",
        icon: Film,
        color: "from-cyan-500/20 to-blue-600/10",
        href: "/cinematics",
    },
    {
        name: "DingsJuice",
        description:
            "Premium vitality drink made from fresh sugarcane. Natural energy with modern branding and AI-powered operations.",
        icon: Zap,
        color: "from-amber-500/20 to-orange-600/10",
        href: "https://dingsjuice.wachaai.com",
    },
    {
        name: "Drop-a-Dime",
        description:
            "Community micro-fundraising platform empowering grassroots causes across Africa.",
        icon: Users,
        color: "from-emerald-500/20 to-teal-600/10",
    },
    {
        name: "Teko",
        description:
            "Event contribution and donation system built for African communities and celebrations.",
        icon: Sparkles,
        color: "from-violet-500/20 to-purple-600/10",
    },
    {
        name: "Yellow Haven Tools",
        description:
            "Hospitality automation software modernizing operations for restaurants and hotels.",
        icon: Code2,
        color: "from-yellow-500/20 to-amber-600/10",
    },
    {
        name: "DingsAgent",
        description:
            "AI automation assistant streamlining business workflows with intelligent task management.",
        icon: Cpu,
        color: "from-sky-500/20 to-cyan-600/10",
    },
];


const PROCESS_STEPS = [
    {
        step: "01",
        title: "Identify",
        description: "Find real problems worth solving across African markets.",
        icon: Target,
    },
    {
        step: "02",
        title: "Build",
        description:
            "Rapid prototype with modern AI-first engineering practices.",
        icon: Layers,
    },
    {
        step: "03",
        title: "Ship",
        description:
            "Deploy fast, iterate faster. Real users from day one.",
        icon: Rocket,
    },
] as const;

const LANG_COLORS: Record<string, string> = {
    TypeScript: "bg-blue-400",
    JavaScript: "bg-yellow-400",
    Python: "bg-green-400",
    Rust: "bg-orange-400",
    Go: "bg-cyan-400",
    Java: "bg-red-400",
    Kotlin: "bg-purple-400",
    HTML: "bg-orange-500",
    CSS: "bg-blue-500",
    Dart: "bg-sky-400",
};

/* ------------------------------------------------------------------ */
/* Animation helpers                                                   */
/* ------------------------------------------------------------------ */
function FadeIn({
    children,
    className = "",
    delay = 0,
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 28 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

function SlideIn({
    children,
    className = "",
    delay = 0,
    direction = "left",
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: "left" | "right";
}) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });
    const x = direction === "left" ? -40 : 40;
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/* ------------------------------------------------------------------ */
/* Subcomponents                                                       */
/* ------------------------------------------------------------------ */
function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const handleNavClick = useCallback(() => setMobileOpen(false), []);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled
                    ? "bg-[#0C1220]/90 border-b border-[#38BDF8]/10 backdrop-blur-md"
                    : "bg-transparent"
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
                <a
                    href="#"
                    className="flex items-center gap-2.5 font-bold tracking-widest text-white text-lg"
                    style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                >
                    <span className="w-3.5 h-3.5 bg-[#38BDF8] shrink-0" />
                    WACHAAI
                </a>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-10">
                    <a href="#products" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground hover:text-white transition-colors">
                        Studio
                    </a>
                    <a href="#cases" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground hover:text-white transition-colors">
                        Solutions
                    </a>
                    <a href="#opensource" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground hover:text-white transition-colors">
                        Creative
                    </a>
                    <a href="#certifications" className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground hover:text-white transition-colors">
                        Credentials
                    </a>
                    
                    <a
                        href="#contact"
                        className="border border-[#38BDF8] text-[#38BDF8] text-xs font-semibold uppercase tracking-[0.15em] px-5 py-2.5 hover:bg-[#38BDF8] hover:text-[#0C1220] transition-colors"
                    >
                        [GET IN TOUCH]
                    </a>
                </div>

                {/* Mobile hamburger */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? (
                        <X className="w-5 h-5" />
                    ) : (
                        <Menu className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden bg-[#0C1220]/95 border-b border-[#38BDF8]/10 px-6 pb-6 space-y-4"
                >
                    <a href="#products" onClick={handleNavClick} className="block text-xs uppercase tracking-widest text-muted-foreground hover:text-white transition-colors py-2">
                        Studio
                    </a>
                    <a href="#cases" onClick={handleNavClick} className="block text-xs uppercase tracking-widest text-muted-foreground hover:text-white transition-colors py-2">
                        Solutions
                    </a>
                    <a href="#opensource" onClick={handleNavClick} className="block text-xs uppercase tracking-widest text-muted-foreground hover:text-white transition-colors py-2">
                        Creative
                    </a>
                    <a href="#certifications" onClick={handleNavClick} className="block text-xs uppercase tracking-widest text-muted-foreground hover:text-white transition-colors py-2">
                        Credentials
                    </a>
                    <a
                        href="#contact"
                        onClick={handleNavClick}
                        className="block border border-[#38BDF8] text-[#38BDF8] text-xs font-semibold uppercase tracking-widest text-center py-2.5 hover:bg-[#38BDF8] hover:text-[#0C1220] transition-colors"
                    >
                        [GET IN TOUCH]
                    </a>
                </motion.div>
            )}
        </motion.nav>
    );
}

function HeroBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-65 mix-blend-screen"
                style={{ backgroundImage: 'url("/circuit-bg.png")' }}
            />
            {/* Soft glows underneath */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[#38BDF8]/[0.05] blur-[150px]" />
        </div>
    );
}

function StatsBanner() {
    return (
        <section className="relative">
            <div className="section-divider" />
            <div className="max-w-5xl mx-auto px-6 md:px-12 py-10 md:py-14">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {STATS.map((stat, i) => (
                        <FadeIn key={stat.label} delay={i * 0.1}>
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-xs tracking-widest uppercase text-muted-foreground">
                                    {stat.label}
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
            <div className="section-divider" />
        </section>
    );
}

function ProcessSection() {
    return (
        <section id="process" className="px-6 md:px-12 py-20 md:py-28 max-w-5xl mx-auto">
            <FadeIn>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                    How We Work
                </span>
                <h2 className="mt-3 text-3xl md:text-4xl font-bold mb-4">
                    From Problem to Product
                </h2>
                <p className="text-sm md:text-base text-muted-foreground mb-16 max-w-lg">
                    We move fast, build lean, and focus on real-world impact.
                </p>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
                {PROCESS_STEPS.map((step, i) => {
                    const Icon = step.icon;
                    return (
                        <FadeIn key={step.step} delay={i * 0.15}>
                            <div className="relative group">
                                {/* Connector line (desktop) */}
                                {i < PROCESS_STEPS.length - 1 && (
                                    <div className="hidden md:block absolute top-10 left-[calc(100%+0.5rem)] w-[calc(100%-1rem)] h-px bg-gradient-to-r from-primary/20 to-transparent" />
                                )}
                                <div className="rounded-2xl border border-border bg-card/50 p-8 hover:border-primary/20 transition-all duration-300 hover:shadow-[0_0_40px_rgba(56,189,248,0.05)]">
                                    <div className="flex items-center gap-4 mb-5">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-3xl font-bold text-primary/20">
                                            {step.step}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">
                                        {step.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        </FadeIn>
                    );
                })}
            </div>
        </section>
    );
}

function CTASection() {
    return (
        <section className="px-6 md:px-12 py-20 md:py-28">
            <FadeIn className="max-w-4xl mx-auto">
                <div className="relative rounded-3xl border border-primary/15 overflow-hidden">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-violet-500/[0.04] to-background" />
                    <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

                    <div className="relative z-10 px-8 py-16 md:px-16 md:py-20 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Let's Build Something{" "}
                            <span className="text-primary">Together</span>
                        </h2>
                        <p className="text-muted-foreground text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">
                            Have an idea? Looking to collaborate? We're always
                            open to partnerships and interesting projects.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a
                                href="mailto:wachaexperience@gmail.com"
                                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all hover:shadow-[0_0_30px_rgba(56,189,248,0.3)] hover:-translate-y-0.5"
                            >
                                <Mail className="w-4 h-4" />
                                Get in Touch
                            </a>
                            <a
                                href="https://github.com/DINGZTRADER"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border text-foreground font-semibold text-sm hover:border-primary/30 transition-all hover:-translate-y-0.5"
                            >
                                <Github className="w-4 h-4" />
                                View GitHub
                            </a>
                        </div>
                    </div>
                </div>
            </FadeIn>
        </section>
    );
}

type Episode = {
    name: string;
    filename: string;
    url: string;
};

function EpisodesLoop() {
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeVideo, setActiveVideo] = useState<Episode | null>(null);

    useEffect(() => {
        const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3001/api" : "/api");
        
        const fetchEpisodes = () => {
            fetch(`${apiBase}/episodes`)
                .then(res => res.json())
                .then((data: Episode[]) => {
                    setEpisodes(prev => {
                        if (JSON.stringify(prev) === JSON.stringify(data)) {
                            return prev;
                        }
                        // Detect if a new video was added
                        if (prev.length > 0 && data.length > 0) {
                            const prevFilenames = new Set(prev.map(ep => ep.filename));
                            const newVideo = data.find(ep => !prevFilenames.has(ep.filename));
                            if (newVideo) {
                                console.log("[EpisodesLoop] New video detected!", newVideo.filename);
                                setActiveVideo(newVideo);
                            }
                        }
                        return data;
                    });
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to load episodes:", err);
                    setLoading(false);
                });
        };

        fetchEpisodes();
        const interval = setInterval(fetchEpisodes, 10000); // Poll every 10 seconds for new renders

        return () => clearInterval(interval);
    }, []);

    // Set first active video when episodes load and no video is active
    useEffect(() => {
        if (episodes.length > 0 && !activeVideo) {
            setActiveVideo(episodes[0]);
        } else if (activeVideo) {
            const exists = episodes.some(ep => ep.filename === activeVideo.filename);
            if (!exists && episodes.length > 0) {
                setActiveVideo(episodes[0]);
            }
        }
    }, [episodes, activeVideo]);

    const handleVideoEnded = () => {
        if (episodes.length === 0 || !activeVideo) return;
        const currentIndex = episodes.findIndex(ep => ep.filename === activeVideo.filename);
        const nextIndex = (currentIndex + 1) % episodes.length;
        setActiveVideo(episodes[nextIndex]);
    };

    if (loading || episodes.length === 0) return null;

    const apiHost = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3001/api" : "/api")).replace("/api", "");

    return (
        <section className="px-6 md:px-12 pt-32 pb-16 md:pt-40 md:pb-20 max-w-6xl mx-auto">
            <FadeIn>
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                            Creative Series
                        </span>
                        <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-white" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                            Missing in Kampala Series
                        </h2>
                        <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-lg">
                            Watch our neural-rendered cinematic thriller episodes, updated live from our render server.
                        </p>
                    </div>
                </div>
            </FadeIn>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* Main Theater Display */}
                {activeVideo && (
                    <div className="lg:col-span-8 rounded-3xl border border-white/10 bg-card/25 overflow-hidden relative group aspect-video shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent z-10 pointer-events-none" />
                        <video
                            key={activeVideo.filename}
                            src={activeVideo.url.startsWith('http') ? activeVideo.url : `${apiHost}${activeVideo.url}`}
                            controls
                            autoPlay
                            muted
                            onEnded={handleVideoEnded}
                            className="w-full h-full object-cover relative z-0"
                        />
                        <div className="absolute bottom-6 left-6 z-20">
                            <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-mono uppercase tracking-wider mb-3 inline-block">
                                NOW PLAYING
                            </span>
                            <h3 className="text-xl md:text-2xl font-bold text-white font-mono">
                                {activeVideo.name}
                            </h3>
                        </div>
                    </div>
                )}

                {/* Looping Thumbnail Track */}
                <div className="lg:col-span-4 space-y-4 max-h-[460px] overflow-y-auto pr-2 scrollbar-thin">
                    <div className="text-xs uppercase font-mono tracking-widest text-muted-foreground mb-2">
                        Episode Directory ({episodes.length})
                    </div>
                    {episodes.map((ep, idx) => {
                        const isActive = activeVideo?.filename === ep.filename;
                        return (
                            <button
                                key={ep.filename}
                                onClick={() => setActiveVideo(ep)}
                                className={`w-full flex items-center gap-4 p-3 rounded-2xl border transition-all text-left ${
                                    isActive
                                        ? "bg-primary/10 border-primary/45 shadow-[0_0_20px_rgba(56,189,248,0.15)]"
                                        : "bg-white/[0.02] border-white/5 hover:border-white/25 hover:bg-white/[0.04]"
                                }`}
                            >
                                <div className="w-24 aspect-video rounded-lg overflow-hidden bg-black shrink-0 relative">
                                    <video
                                        src={ep.url.startsWith('http') ? ep.url : `${apiHost}${ep.url}`}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover opacity-60"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <Play className="w-4 h-4 text-white fill-current opacity-80" />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-mono uppercase text-primary/60">
                                        Episode 0{idx + 1}
                                    </div>
                                    <div className="text-sm font-bold text-white line-clamp-1 font-mono">
                                        {ep.name}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/* Main Page                                                           */
/* ------------------------------------------------------------------ */
export default function Home() {
    const [repos, setRepos] = useState<GitHubRepo[]>([]);
    const [loadingRepos, setLoadingRepos] = useState(true);
    const heroRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"],
    });
    const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 60]);

    useEffect(() => {
        fetch("https://api.github.com/users/DINGZTRADER/repos")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch repos");
                return res.json();
            })
            .then((data: unknown) => {
                if (!Array.isArray(data)) return;
                const filtered = (data as GitHubRepo[])
                    .filter((repo) => !repo.fork)
                    .sort((a, b) => b.stargazers_count - a.stargazers_count)
                    .slice(0, 6);
                setRepos(filtered);
            })
            .catch(() => setRepos([]))
            .finally(() => setLoadingRepos(false));
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground noise">
            <SEO 
                title="WachaAI | AI Consultancy & Business Automation | Kampala, Uganda"
                description="WachaAI is Uganda's premier AI venture studio and consultancy in Kampala. We design custom AI models, ChatGPT integrations, and business automations."
                keywords="AI Uganda, AI Consultancy Uganda, AI Kampala, ChatGPT Uganda, Business Automation Kampala, custom AI chatbot Uganda"
            />
            <Navbar />

            {/* ── Uganda flag accent bar ─────────────────────────────── */}
            <div
                className="h-[3px] w-full shrink-0 relative z-50"
                style={{
                    background:
                        "linear-gradient(to right, #000 0%, #000 16.66%, #FCDC04 16.66%, #FCDC04 33.33%, #D90000 33.33%, #D90000 50%, #000 50%, #000 66.66%, #FCDC04 66.66%, #FCDC04 83.33%, #D90000 83.33%, #D90000 100%)",
                }}
            />

            <EpisodesLoop />
            <div className="section-divider" />

            {/* ── Hero ───────────────────────────────────────────────── */}
            <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0C1220]">
                <HeroBackground />
                <motion.div
                    style={{ opacity: heroOpacity, y: heroY }}
                    className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pt-40 pb-24 text-left w-full"
                >
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.3em] text-[#38BDF8] uppercase mb-8"
                    >
                        <span className="w-1.5 h-6 bg-[#38BDF8] inline-block shrink-0" />
                        SYSTEM INITIALIZATION
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] text-white"
                        style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                    >
                        AI venture studio
                        <br />
                        building <span className="text-[#38BDF8]">practical</span>
                        <br />
                        <span className="text-[#38BDF8]">technology</span> from
                        <br />
                        Kampala, Uganda.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.8,
                            delay: 0.2,
                            ease: "easeOut",
                        }}
                        className="mt-8 text-base md:text-lg text-muted-foreground/80 max-w-2xl leading-relaxed font-light"
                        style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                    >
                        Developing pragmatic software and digital platforms to solve real-world problems.
                        <br />
                        Accessible, impactful, and engineered for the African market.
                    </motion.p>

                    {/* Contact CTA Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="mt-12 flex flex-col sm:flex-row items-center gap-4 relative z-10"
                    >
                        <a
                            href="https://wa.me/256704650600"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-none bg-[#38BDF8] text-[#0C1220] font-bold uppercase tracking-[0.15em] text-xs hover:brightness-110 transition-all hover:shadow-[0_0_30px_rgba(56,189,248,0.3)] hover:-translate-y-0.5"
                        >
                            <Zap className="w-4 h-4" />
                            WhatsApp Us
                        </a>
                        <a
                            href="tel:0704650600"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-none border border-white/20 text-white font-bold uppercase tracking-[0.15em] text-xs hover:border-[#38BDF8]/40 transition-all hover:-translate-y-0.5"
                        >
                            <Phone className="w-4 h-4 text-[#38BDF8]" />
                            Call: 0704650600
                        </a>
                        <a
                            href="mailto:wachaexperience@gmail.com"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-none border border-white/20 text-white font-bold uppercase tracking-[0.15em] text-xs hover:border-[#38BDF8]/40 transition-all hover:-translate-y-0.5"
                        >
                            <Mail className="w-4 h-4 text-[#38BDF8]" />
                            Email Us
                        </a>
                    </motion.div>

                    {/* Scroll indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="mt-20"
                    >
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        >
                            <ChevronDown className="w-5 h-5 text-[#38BDF8]/60" />
                        </motion.div>
                    </motion.div>
                </motion.div>
            </section>

            {/* ── Banner Image ───────────────────────────────────────── */}
            <section className="px-6 md:px-12 py-8 md:py-12">
                <FadeIn className="max-w-4xl mx-auto">
                    <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-card/30 shadow-2xl shadow-black/20 group">
                        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <img
                            src="/wachaai-banner.jpg"
                            alt="WachaAI Smart Digital Solutions for Africa"
                            className="w-full h-auto object-cover block group-hover:scale-[1.02] transition-transform duration-700"
                            loading="lazy"
                            width="1200"
                            height="630"
                        />
                    </div>
                </FadeIn>
            </section>

            {/* ── Stats ──────────────────────────────────────────────── */}
            <StatsBanner />

            {/* ── Clients ────────────────────────────────────────────── */}
            <Clients />
            <div className="section-divider" />

            {/* ── Case Studies ────────────────────────────────────────── */}
            <CaseStudies />
            <div className="section-divider" />



            {/* ── Products ───────────────────────────────────────────── */}
            <section
                id="products"
                className="px-6 md:px-12 py-20 md:py-28 max-w-5xl mx-auto"
            >
                <FadeIn>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                        What We Build
                    </span>
                    <h2 className="mt-3 text-3xl md:text-4xl font-bold mb-4">
                        Our Products
                    </h2>
                    <p className="text-sm md:text-base text-muted-foreground mb-14 max-w-lg">
                        Digital platforms and AI tools solving real problems
                        across Africa.
                    </p>
                </FadeIn>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {PRODUCTS.map((product, i) => {
                        const Icon = product.icon;
                        const isInternal = product.href?.startsWith("/");
                        
                        const renderContent = () => (
                            <>
                                {/* Gradient accent */}
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${product.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                                />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        {product.href && (
                                            <ExternalLink className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                                        )}
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                                        {product.name}
                                    </h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {product.description}
                                    </p>
                                </div>
                            </>
                        );

                        const cardClass = `group block rounded-2xl border border-border bg-card/40 p-7 hover:border-primary/25 hover:-translate-y-1.5 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(56,189,248,0.06)] h-full relative overflow-hidden`;

                        return (
                            <FadeIn key={product.name} delay={i * 0.1}>
                                {isInternal ? (
                                    <Link to={product.href!} className={cardClass}>
                                        {renderContent()}
                                    </Link>
                                ) : product.href ? (
                                    <a href={product.href} target="_blank" rel="noopener noreferrer" className={cardClass}>
                                        {renderContent()}
                                    </a>
                                ) : (
                                    <div className={cardClass}>
                                        {renderContent()}
                                    </div>
                                )}
                            </FadeIn>
                        );
                    })}
                </div>
            </section>

            <div className="section-divider" />

            {/* ── Process ────────────────────────────────────────────── */}
            <ProcessSection />

            <div className="section-divider" />

            {/* ── Open Source ─────────────────────────────────────────── */}
            <section
                id="opensource"
                className="px-6 md:px-12 py-20 md:py-28 max-w-5xl mx-auto"
            >
                <FadeIn>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                        Community
                    </span>
                    <h2 className="mt-3 text-3xl md:text-4xl font-bold mb-4">
                        Open Source
                    </h2>
                    <p className="text-sm md:text-base text-muted-foreground mb-14 max-w-lg">
                        Contributing to the developer community. Building in the
                        open.
                    </p>
                </FadeIn>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {loadingRepos
                        ? Array.from({ length: 6 }).map((_, i) => (
                              <Skeleton
                                  key={i}
                                  className="h-44 rounded-2xl"
                              />
                          ))
                        : repos.length === 0
                          ? (
                              <p className="text-muted-foreground col-span-full">
                                  No repositories found.
                              </p>
                          )
                          : repos.map((repo, i) => (
                              <FadeIn key={repo.id} delay={i * 0.08}>
                                  <a
                                      href={repo.html_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block group rounded-2xl border border-border bg-card/40 p-6 hover:border-primary/25 hover:-translate-y-1.5 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(56,189,248,0.06)] h-full"
                                  >
                                      <h3 className="text-base font-semibold mb-2 group-hover:text-primary transition-colors truncate">
                                          {repo.name}
                                      </h3>
                                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4">
                                          {repo.description ||
                                              "GitHub project"}
                                      </p>
                                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                          <span className="flex items-center gap-1">
                                              <Star className="w-3.5 h-3.5" />
                                              {repo.stargazers_count}
                                          </span>
                                          {repo.language && (
                                              <span className="flex items-center gap-1.5">
                                                  <span
                                                      className={`w-2.5 h-2.5 rounded-full ${
                                                          LANG_COLORS[
                                                              repo.language
                                                          ] || "bg-gray-400"
                                                      }`}
                                                  />
                                                  {repo.language}
                                              </span>
                                          )}
                                      </div>
                                  </a>
                              </FadeIn>
                          ))}
                </div>

                {/* GitHub link */}
                <FadeIn delay={0.3}>
                    <div className="mt-10 text-center">
                        <a
                            href="https://github.com/DINGZTRADER"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:brightness-125 transition-all group"
                        >
                            View all repositories
                            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </a>
                    </div>
                </FadeIn>
            </section>

            <div className="section-divider" />

            {/* ── Certifications ──────────────────────────────────────── */}
            <section
                id="certifications"
                className="px-6 md:px-12 py-20 md:py-28 max-w-5xl mx-auto"
            >
                <FadeIn>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                        Verified
                    </span>
                    <h2 className="mt-3 text-3xl md:text-4xl font-bold mb-4">
                        Credentials
                    </h2>
                    <p className="text-sm md:text-base text-muted-foreground mb-14 max-w-lg">
                        Google Professional Certifications backing our AI
                        engineering expertise.
                    </p>
                </FadeIn>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <SlideIn delay={0.1} direction="left" className="h-full">
                        <a
                            href="/Coursera%201RABKK3ZU20D.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group rounded-2xl border border-border bg-card/40 p-7 hover:border-primary/25 hover:-translate-y-1.5 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(56,189,248,0.06)] h-full relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary mb-5">
                                    <Award className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                                    Analyze Images with Google Vision API
                                </h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Google Coursera Certificate •{" "}
                                    <span className="font-mono text-xs">
                                        1RABKK3ZU20D
                                    </span>
                                </p>
                            </div>
                        </a>
                    </SlideIn>
                    <SlideIn delay={0.2} direction="right" className="h-full">
                        <a
                            href="/Coursera%20ICD0JHFFB04X.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group rounded-2xl border border-border bg-card/40 p-7 hover:border-primary/25 hover:-translate-y-1.5 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(56,189,248,0.06)] h-full relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary mb-5">
                                    <Award className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                                    Build AI Apps with Gemini in Android Studio
                                </h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Google Coursera Certificate •{" "}
                                    <span className="font-mono text-xs">
                                        ICD0JHFFB04X
                                    </span>
                                </p>
                            </div>
                        </a>
                    </SlideIn>
                </div>
            </section>

            <div className="section-divider" />

            {/* ── About ──────────────────────────────────────────────── */}
            <section
                id="about"
                className="px-6 md:px-12 py-20 md:py-28 max-w-5xl mx-auto"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
                    <SlideIn direction="left">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                            Our Story
                        </span>
                        <h2 className="mt-3 text-3xl md:text-4xl font-bold mb-6">
                            About WachaAI
                        </h2>
                        <div className="space-y-4 text-muted-foreground text-sm md:text-base leading-relaxed">
                            <p>
                                WachaAI is a venture studio creating AI
                                software, digital platforms, and real-world
                                ventures from <strong className="text-foreground/80">Kampala, Uganda</strong>.
                            </p>
                            <p>
                                We believe in building practical technology that
                                solves problems for people across Africa and
                                beyond. From sugarcane juice to AI agents —
                                every venture is rooted in real-world need.
                            </p>
                            <p>
                                Founded by{" "}
                                <strong className="text-foreground/80">
                                    Peter Wacha
                                </strong>
                                , we combine AI engineering with grassroots
                                entrepreneurship to create products that matter.
                            </p>
                        </div>
                    </SlideIn>

                    <SlideIn direction="right" delay={0.2}>
                        <div className="relative rounded-2xl border border-border bg-card/40 p-8 overflow-hidden">
                            <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-xl">
                                        PW
                                    </div>
                                    <div>
                                        <div className="font-semibold">
                                            Peter Wacha
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Founder & Engineer
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <MapPin className="w-4 h-4 text-primary/60" />
                                        Kampala, Uganda
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Code2 className="w-4 h-4 text-primary/60" />
                                        AI / Full-Stack / Mobile
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Sparkles className="w-4 h-4 text-primary/60" />
                                        Building since 2024
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-border flex items-center gap-6">
                                    <a
                                        href="https://github.com/DINGZTRADER"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:brightness-125 transition-all group"
                                    >
                                        <Github className="w-4 h-4" />
                                        @DINGZTRADER
                                        <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </a>
                                    <a
                                        href="/Peter_Wacha_Executive_CV.pdf"
                                        download
                                        className="inline-flex items-center gap-2 text-sm text-foreground/80 font-semibold hover:text-primary transition-all group"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download CV
                                    </a>
                                </div>
                            </div>
                        </div>
                    </SlideIn>
                </div>
            </section>

            {/* ── CTA ────────────────────────────────────────────────── */}
            <CTASection />

            {/* ── Footer ─────────────────────────────────────────────── */}
            <footer className="border-t border-border">
                <div className="max-w-5xl mx-auto px-6 md:px-12 py-14">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
                        {/* Brand */}
                        <div>
                            <div className="text-2xl font-bold mb-3">
                                Wacha
                                <span className="text-primary">AI</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                                AI venture studio building practical technology
                                from Kampala, Uganda.
                            </p>
                        </div>

                        {/* Quick links */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-4">
                                Navigate
                            </h4>
                            <div className="space-y-2.5">
                                {NAV_LINKS.map((link) => (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                                <Link
                                    to="/contact"
                                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Contact
                                </Link>
                                <div className="h-px w-full bg-border my-1" />
                                {MUSIC_LINKS.map((link) => (
                                    <Link
                                        key={link.href}
                                        to={link.href}
                                        className="flex items-center gap-1.5 text-sm text-primary/70 hover:text-primary transition-colors"
                                    >
                                        <link.icon className="w-3.5 h-3.5" />
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Connect */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-4">
                                Connect
                            </h4>
                            <div className="space-y-2.5">
                                <a
                                    href="https://github.com/DINGZTRADER"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Github className="w-4 h-4" /> GitHub
                                </a>
                                <a
                                    href="mailto:wachaexperience@gmail.com"
                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Mail className="w-4 h-4" /> Email
                                </a>
                                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4" /> Kampala,
                                    Uganda
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-xs text-muted-foreground/50">
                            &copy; {new Date().getFullYear()} WachaAI. All
                            rights reserved.
                        </p>
                        <p className="text-xs text-muted-foreground/40">
                            Built with ❤️ in Kampala
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
