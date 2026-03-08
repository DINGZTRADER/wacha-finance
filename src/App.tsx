import { useState, useEffect, useRef } from "react";
import type { ReactNode, ElementType } from "react";
import { motion, useInView } from "motion/react";
import {
    ArrowUpRight,
    Star,
    Users,
    Sparkles,
    Code2,
    Cpu,
    MapPin,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
/* ------------------------------------------------------------------ /
/ Types /
/ ------------------------------------------------------------------ */
type GitHubRepo = {
    id: number;
    name: string;
    description: string | null;
    html_url: string;
    stargazers_count: number;
    language: string | null;
    fork: boolean;
};
/* ------------------------------------------------------------------ /
/ Static data /
/ ------------------------------------------------------------------ */
const PRODUCTS: { name: string; description: string; icon: ElementType }[] = [
    {
        name: "Drop-a-Dime",
        description: "Community micro-fundraising platform for grassroots causes.",
        icon: Users,
    },
    {
        name: "Teko",
        description:
            "Event contribution and donation system built for communities.",
        icon: Sparkles,
    },
    {
        name: "Yellow Haven Tools",
        description:
            "Hospitality automation software for modern establishments.",
        icon: Code2,
    },
    {
        name: "DingsAgent",
        description: "AI automation assistant for business workflows.",
        icon: Cpu,
    },
];

/* ------------------------------------------------------------------ /
/ Shared animation wrapper /
/ ------------------------------------------------------------------ */
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
    const isInView = useInView(ref, { once: true, margin: "-80px" });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
/* ------------------------------------------------------------------ /
/ Page /
/ ------------------------------------------------------------------ */
export default function Index() {
    const [repos, setRepos] = useState<GitHubRepo[]>([]);
    const [loadingRepos, setLoadingRepos] = useState(true);
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
        <div className="min-h-screen bg-background text-foreground">
            {/* ── Uganda flag bar ───────────────────────────────────────── */}
            <div
                className="h-1.5 w-full shrink-0"
                style={{
                    background:
                        "linear-gradient(to right, #000 0%, #000 16.66%, #FCDC04 16.66%, #FCDC04 33.33%, #D90000 33.33%, #D90000 50%, #000 50%, #000 66.66%, #FCDC04 66.66%, #FCDC04 83.33%, #D90000 83.33%, #D90000 100%)",
                }}
            />
            {/* ── Hero ──────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden">
                {/* Ambient glow layers */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(0.25_0.08_230)_0%,_transparent_70%)] opacity-40" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_oklch(0.2_0.06_260)_0%,_transparent_60%)] opacity-30" />

                <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-28 md:py-44 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.08] text-balance"
                    >
                        Building AI Ventures
                        <br className="hidden sm:block" />
                        <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                            {" "}
                            From Uganda
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                    >
                        Practical AI tools, digital ventures, and real-world platforms built
                        in Kampala.
                    </motion.p>
                </div>
            </section>

            {/* ── Feature: DingsJuice ───────────────────────────────────── */}
            <section className="px-6 md:px-12 pb-24">
                <FadeIn className="max-w-3xl mx-auto">
                    <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-card to-background p-8 md:p-12 overflow-hidden">
                        {/* Decorative glow */}
                        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10">
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                                Featured
                            </span>
                            <h2 className="mt-3 text-3xl md:text-4xl font-bold">
                                DingsJuice
                            </h2>
                            <p className="mt-4 text-muted-foreground text-lg leading-relaxed max-w-xl">
                                A premium vitality drink made from fresh sugarcane. Natural
                                energy with modern branding.
                            </p>
                            <a
                                href="https://dingsjuice.wachaai.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 mt-6 text-primary hover:brightness-125 font-medium transition-all group"
                            >
                                Visit Project
                                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </a>
                        </div>
                    </div>
                </FadeIn>
            </section>

            {/* ── Products ──────────────────────────────────────────────── */}
            <section id="products" className="px-6 md:px-12 py-24 max-w-6xl mx-auto">
                <FadeIn>
                    <h2 className="text-3xl md:text-4xl font-bold mb-3">Products</h2>
                    <p className="text-muted-foreground mb-14 max-w-lg">
                        Digital platforms and tools solving real problems across Africa.
                    </p>
                </FadeIn>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {PRODUCTS.map((product, i) => {
                        const Icon = product.icon;
                        return (
                            <FadeIn key={product.name} delay={i * 0.1}>
                                <div className="group rounded-xl border border-border bg-card p-7 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(56,189,248,0.07)]">
                                    <Icon className="w-8 h-8 text-primary mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">
                                        {product.name}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {product.description}
                                    </p>
                                </div>
                            </FadeIn>
                        );
                    })}
                </div>
            </section>

            {/* ── Open Source ────────────────────────────────────────────── */}
            <section
                id="opensource"
                className="px-6 md:px-12 py-24 max-w-6xl mx-auto"
            >
                <FadeIn>
                    <h2 className="text-3xl md:text-4xl font-bold mb-3">Open Source</h2>
                    <p className="text-muted-foreground mb-14 max-w-lg">
                        Contributing to the developer community, one repo at a time.
                    </p>
                </FadeIn>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {loadingRepos
                        ? Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-40 rounded-xl" />
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
                                        className="block group rounded-xl border border-border bg-card p-6 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(56,189,248,0.07)] h-full"
                                    >
                                        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors truncate">
                                            {repo.name}
                                        </h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                                            {repo.description || "GitHub project"}
                                        </p>
                                        <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Star className="w-3.5 h-3.5" />
                                                {repo.stargazers_count}
                                            </span>
                                            {repo.language && <span>{repo.language}</span>}
                                        </div>
                                    </a>
                                </FadeIn>
                            ))}
                </div>
            </section>

            {/* ── About ─────────────────────────────────────────────────── */}
            <section id="about" className="px-6 md:px-12 py-24 max-w-3xl mx-auto">
                <FadeIn>
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">About</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        WachaAI is a venture studio creating AI software, digital platforms,
                        and real-world ventures from Kampala, Uganda. We believe in building
                        practical technology that solves problems for people across Africa
                        and beyond.
                    </p>
                </FadeIn>
            </section>

            {/* ── Footer ────────────────────────────────────────────────── */}
            <footer className="border-t border-border px-6 md:px-12 py-12">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-2xl font-bold">
                        Wacha<span className="text-primary">AI</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            Kampala, Uganda
                        </span>
                        <span>
                            Founder —{" "}
                            <strong className="text-foreground/80">Peter Wacha</strong>
                        </span>
                    </div>

                    <p className="text-xs text-muted-foreground/50">
                        &copy; {new Date().getFullYear()} WachaAI
                    </p>
                </div>
            </footer>
        </div>
    );
}
