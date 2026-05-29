import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Building2, ShoppingBag, Wheat, ArrowUpRight } from "lucide-react";

interface CaseStudy {
    id: string;
    tag: string;
    title: string;
    description: string;
    solution: string;
    metrics: { value: string; label: string }[];
    icon: any;
    color: string;
    keywords: string[];
}

const CASE_STUDIES: CaseStudy[] = [
    {
        id: "hospitality-hotel-ai",
        tag: "Hospitality & Tourism",
        title: "Automating Guest Bookings for Kampala Hotels",
        description: "How a custom WhatsApp AI assistant helped boutique hotels in Kampala automate room reservations, answer local queries, and capture late-night travelers instantly.",
        solution: "We built a specialized WhatsApp AI booking agent that answers FAQs, processes pricing dynamically, and collects reservation information, integrating seamlessly with local payment systems.",
        metrics: [
            { value: "35%", label: "Increase in Direct Bookings" },
            { value: "24/7", label: "Instant Multi-lingual Support" }
        ],
        icon: Building2,
        color: "from-blue-500/20 to-indigo-600/10 text-blue-400 border-blue-500/20",
        keywords: ["Kampala hotels AI", "WhatsApp hotel booking assistant Uganda", "Hospitality automation Kampala"]
    },
    {
        id: "agro-processing-supply-chain",
        tag: "Agriculture & Supply Chain",
        title: "Predictive Stock Automation for Jinja Agro-Processors",
        description: "How custom predictive algorithms and automated stock agents synchronized grain and sugarcane processing inventory with farmer harvesting cycles in eastern Uganda.",
        solution: "We engineered an offline-resilient inventory dashboard connected to a WhatsApp gateway that automatically requests supplier stock levels and forecasts processing capacity based on weather data.",
        metrics: [
            { value: "-22%", label: "Inventory Waste Reduction" },
            { value: "5 hrs", label: "Saved in Logistics Weekly" }
        ],
        icon: Wheat,
        color: "from-emerald-500/20 to-teal-600/10 text-emerald-400 border-emerald-500/20",
        keywords: ["Jinja agro-processing AI", "Uganda crop forecasting tools", "Agricultural stock automation"]
    },
    {
        id: "retail-e-commerce-chatgpt",
        tag: "Retail & E-Commerce",
        title: "ChatGPT Assistants for Mobile-Money Native Stores",
        description: "How custom language model integrations enabled fast-growing Kampala retail brands to handle thousands of product inquiries, check stock, and prompt mobile money transactions automatically.",
        solution: "We created a fine-tuned product recommendation assistant integrated with retail inventory APIs, generating quick quotes and triggering Airtel & MTN MoMo payment prompts directly.",
        metrics: [
            { value: "4.8x", label: "More Daily Support Leads" },
            { value: "45%", label: "Higher Customer Engagement" }
        ],
        icon: ShoppingBag,
        color: "from-amber-500/20 to-orange-600/10 text-amber-400 border-amber-500/20",
        keywords: ["ChatGPT integration Uganda", "Mobile money AI payments", "Kampala e-commerce chatbot"]
    }
];

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 28 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
}

export default function CaseStudies() {
    return (
        <section id="cases" className="px-6 md:px-12 py-20 md:py-28 max-w-5xl mx-auto">
            <FadeIn>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                    Real World Impact
                </span>
                <h2 className="mt-3 text-3xl md:text-4xl font-bold mb-4">
                    Case Studies & Local Success Stories
                </h2>
                <p className="text-sm md:text-base text-muted-foreground mb-16 max-w-2xl">
                    Discover how WachaAI designs custom AI engines, automation systems, and intelligent bots to resolve specific business bottlenecks in Uganda.
                </p>
            </FadeIn>

            <div className="space-y-8">
                {CASE_STUDIES.map((study, i) => {
                    const Icon = study.icon;
                    return (
                        <FadeIn key={study.id} delay={i * 0.1}>
                            <div className="group relative rounded-3xl border border-border bg-card/30 p-8 md:p-10 hover:border-primary/20 transition-all duration-300 hover:shadow-[0_0_40px_rgba(56,189,248,0.04)] overflow-hidden backdrop-blur-sm">
                                <div className={`absolute inset-0 bg-gradient-to-br ${study.color.split(" ")[0]} ${study.color.split(" ")[1]} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                                
                                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start justify-between">
                                    <div className="flex-1 space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 ${study.color.split(" ")[2]}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs font-semibold tracking-wider uppercase text-primary">
                                                {study.tag}
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                                                {study.title}
                                            </h3>
                                            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-4">
                                                {study.description}
                                            </p>
                                            <p className="text-xs md:text-sm text-foreground/80 leading-relaxed border-l-2 border-primary/40 pl-4 py-1 italic bg-primary/[0.01]">
                                                <strong className="text-primary not-italic font-semibold">Solution: </strong> 
                                                {study.solution}
                                            </p>
                                        </div>

                                        {/* SEO Keyword tags */}
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {study.keywords.map((kw) => (
                                                <span key={kw} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground">
                                                    #{kw}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Metrics section */}
                                    <div className="w-full md:w-56 shrink-0 flex flex-row md:flex-col gap-6 md:gap-8 justify-between border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 md:pl-8">
                                        {study.metrics.map((metric, idx) => (
                                            <div key={idx} className="space-y-1">
                                                <div className="text-3xl font-extrabold text-primary tracking-tight">
                                                    {metric.value}
                                                </div>
                                                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                                    {metric.label}
                                                </div>
                                            </div>
                                        ))}
                                        
                                        <div className="hidden md:block pt-2">
                                            <a 
                                                href="mailto:wachaexperience@gmail.com?subject=Inquiry%20regarding%20WachaAI%20Case%20Study" 
                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary/80 group-hover:text-primary hover:underline transition-colors"
                                            >
                                                Request similar setup
                                                <ArrowUpRight className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    );
                })}
            </div>
        </section>
    );
}
