import { useState } from "react";
import { ArrowLeft, Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

export default function Contact() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("sending");

        try {
            // Formspree payload or custom handler
            const response = await fetch("https://formspree.io/f/xoqgypwp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    subject,
                    message,
                    _to: "wachaexperience@gmail.com",
                }),
            });

            if (response.ok) {
                setStatus("success");
                setName("");
                setEmail("");
                setSubject("");
                setMessage("");
            } else {
                setStatus("error");
            }
        } catch (err) {
            console.error("Submission error:", err);
            setStatus("error");
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground dot-grid relative overflow-hidden">
            <SEO 
                title="Contact WachaAI | Reach Us in Kampala, Uganda"
                description="Get in touch with WachaAI in Kampala, Uganda. Contact us via email, phone, or by filling out our online message form."
                keywords="WachaAI contact, AI consultancy email, Peter Wacha phone, Kampala tech venture studio"
            />

            {/* Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-primary/[0.06] blur-[120px]" />
                <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] rounded-full bg-violet-500/[0.04] blur-[140px]" />
            </div>

            {/* Header */}
            <div className="border-b border-border relative z-10">
                <div className="max-w-5xl mx-auto px-6 md:px-12 py-6 flex items-center gap-4">
                    <Link
                        to="/"
                        className="text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2 rounded-lg hover:bg-muted/40"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                            <Mail className="w-7 h-7 text-primary" />
                            Contact Us
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Get in touch for AI consultations, automations, or questions.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="max-w-5xl mx-auto px-6 md:px-12 py-12 md:py-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                    {/* Left Column: Contact Cards */}
                    <div className="lg:col-span-5 space-y-6">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                                Reach Out
                            </span>
                            <h2 className="text-3xl font-bold mt-2 mb-6">
                                We'd Love to Hear From You
                            </h2>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                                Have an automation idea? Looking to integrate ChatGPT? Or just want to say hello? Choose your preferred way to contact us.
                            </p>
                        </div>

                        {/* Email Card */}
                        <div className="group rounded-2xl border border-border bg-card/40 p-6 hover:border-primary/25 transition-all duration-300 relative overflow-hidden backdrop-blur-sm">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10 flex gap-4">
                                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary shrink-0">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-1">Email Us</h3>
                                    <p className="text-xs text-muted-foreground mb-2">For general support and inquiries</p>
                                    <a href="mailto:wachaexperience@gmail.com" className="text-sm text-primary hover:underline block font-medium">
                                        wachaexperience@gmail.com
                                    </a>
                                    <a href="mailto:peter.wacha@wachaai.com" className="text-sm text-primary hover:underline block font-medium mt-1">
                                        peter.wacha@wachaai.com
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Phone Card */}
                        <div className="group rounded-2xl border border-border bg-card/40 p-6 hover:border-primary/25 transition-all duration-300 relative overflow-hidden backdrop-blur-sm">
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10 flex gap-4">
                                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary shrink-0">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-1">Call / WhatsApp</h3>
                                    <p className="text-xs text-muted-foreground mb-2">Available for quick queries</p>
                                    <a href="tel:+256704650600" className="text-sm text-primary hover:underline block font-medium">
                                        +256 704 650 600
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Location Card */}
                        <div className="group rounded-2xl border border-border bg-card/40 p-6 hover:border-primary/25 transition-all duration-300 relative overflow-hidden backdrop-blur-sm">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10 flex gap-4">
                                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary shrink-0">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-1">Studio Location</h3>
                                    <p className="text-xs text-muted-foreground mb-1">Venture Studio Headquarters</p>
                                    <span className="text-sm text-foreground/80 font-medium">
                                        Kampala, Uganda
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Contact Form */}
                    <div className="lg:col-span-7">
                        <div className="rounded-2xl border border-border bg-card/30 p-8 backdrop-blur-md relative overflow-hidden">
                            <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

                            <h3 className="text-xl font-bold mb-6">Send us a Message</h3>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3 rounded-xl bg-muted/20 border border-border focus:border-primary/50 focus:bg-muted/30 focus:outline-none transition-all text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="john@example.com"
                                        className="w-full px-4 py-3 rounded-xl bg-muted/20 border border-border focus:border-primary/50 focus:bg-muted/30 focus:outline-none transition-all text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        required
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="How can we help?"
                                        className="w-full px-4 py-3 rounded-xl bg-muted/20 border border-border focus:border-primary/50 focus:bg-muted/30 focus:outline-none transition-all text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        required
                                        rows={5}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Write your message here..."
                                        className="w-full px-4 py-3 rounded-xl bg-muted/20 border border-border focus:border-primary/50 focus:bg-muted/30 focus:outline-none transition-all text-sm resize-none"
                                    />
                                </div>

                                {status === "success" && (
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                                        <span>Thank you! Your message has been sent successfully to wachaexperience@gmail.com.</span>
                                    </div>
                                )}

                                {status === "error" && (
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        <span>Oops! Something went wrong. Please try again or email us directly.</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={status === "sending"}
                                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 disabled:brightness-90 transition-all cursor-pointer"
                                >
                                    {status === "sending" ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
