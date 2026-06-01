import { useRef } from "react";
import { Building2, Landmark, Hotel, Plus } from "lucide-react";

interface Client {
    name: string;
    type: string;
    icon: any;
    color: string;
}

const CLIENTS: Client[] = [
    {
        name: "Okello Oryem & Co Advocates",
        type: "Legal Services & Counsel",
        icon: Landmark,
        color: "from-blue-500/10 to-indigo-600/5 text-blue-400 border-blue-500/20",
    },
    {
        name: "Institute of Corporate Governance Uganda (ICGU)",
        type: "Corporate Governance & Training",
        icon: Building2,
        color: "from-emerald-500/10 to-teal-600/5 text-emerald-400 border-emerald-500/20",
    },
    {
        name: "Source Garden Hotel Jinja",
        type: "Hospitality & Accommodation",
        icon: Hotel,
        color: "from-amber-500/10 to-orange-600/5 text-amber-400 border-amber-500/20",
    },
];

export default function Clients() {
    const sectionRef = useRef<HTMLDivElement>(null);

    return (
        <section id="clients" ref={sectionRef} className="px-6 md:px-12 py-16 md:py-24 max-w-5xl mx-auto">
            <div className="text-center md:text-left mb-12">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                    Trusted By
                </span>
                <h2 className="mt-3 text-3xl md:text-4xl font-bold">
                    Our Partners & Clients
                </h2>
                <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-xl">
                    We collaborate with leading advocacy firms, national corporate networks, and premier hospitality venues to deliver intelligent AI integrations.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {CLIENTS.map((client, i) => {
                    const Icon = client.icon;
                    return (
                        <div
                            key={i}
                            className={`group relative rounded-2xl border ${client.color.split(" ")[2]} bg-card/30 p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(56,189,248,0.04)] overflow-hidden backdrop-blur-sm flex flex-col justify-between min-h-[160px]`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${client.color.split(" ")[0]} ${client.color.split(" ")[1]} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                            
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                                        {client.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {client.type}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Placeholder card for future client additions */}
                <div
                    className="group relative rounded-2xl border border-dashed border-border bg-transparent p-6 hover:border-primary/40 hover:bg-card/10 transition-all duration-300 overflow-hidden flex flex-col justify-center items-center min-h-[160px] cursor-pointer"
                    onClick={() => {
                        window.location.href = "mailto:wachaexperience@gmail.com?subject=Partner%20with%20WachaAI";
                    }}
                >
                    <div className="flex flex-col items-center text-center space-y-3 relative z-10">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-dashed border-muted-foreground/30 text-muted-foreground group-hover:text-primary group-hover:border-primary transition-colors">
                            <Plus className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                Your Project Next?
                            </h3>
                            <p className="text-[11px] text-muted-foreground/60 mt-1">
                                Partner with us to build with AI
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
