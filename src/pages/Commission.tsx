import { useState } from "react";
import { motion } from "motion/react";
import {
    ArrowLeft,
    Mic2,
    Phone,
    User,
    Mail,
    Link2,
    CheckCircle,
    Loader2,
    Copy,
    Check,
    FileAudio,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api, type CommissionResponse } from "@/lib/api";

type Step = "form" | "processing" | "instructions" | "success";

const GENRES = [
    "Afrobeat",
    "Hip-Hop",
    "Dancehall",
    "Gospel",
    "R&B",
    "Pop",
    "Reggae",
    "Drill",
    "Amapiano",
    "Other",
];

export default function Commission() {
    const [step, setStep] = useState<Step>("form");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [description, setDescription] = useState("");
    const [genre, setGenre] = useState("");
    const [referenceLinks, setReferenceLinks] = useState("");
    const [payDeposit, setPayDeposit] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"mtn_momo" | "airtel">(
        "airtel"
    );
    const [error, setError] = useState("");
    const [result, setResult] = useState<CommissionResponse | null>(null);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim() || !phone.trim() || !description.trim()) {
            setError("Name, phone, and description are required");
            return;
        }
        if (!/^0[37]\d{8}$/.test(phone.replace(/\s/g, ""))) {
            setError("Enter a valid Uganda phone number");
            return;
        }

        setError("");
        setStep("processing");

        try {
            const res = await api.submitCommission({
                client_name: name,
                client_phone: phone.replace(/\s/g, ""),
                client_email: email || undefined,
                description,
                genre: genre || undefined,
                reference_links: referenceLinks || undefined,
                pay_deposit: payDeposit,
                payment_method: payDeposit ? paymentMethod : undefined,
            });
            setResult(res);
            setStep(
                res.payment_mode === "manual" ? "instructions" : "success"
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : "Submission failed");
            setStep("form");
        }
    };

    const copyRef = () => {
        if (result?.payment_info?.reference) {
            navigator.clipboard.writeText(result.payment_info.reference);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <div className="border-b border-border">
                <div className="max-w-5xl mx-auto px-6 md:px-12 py-6 flex items-center gap-4">
                    <Link
                        to="/"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                            <Mic2 className="w-7 h-7 text-primary" />
                            Commission Custom Music
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Get a custom track made just for you.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 md:px-12 py-10">
                {/* Pricing card */}
                <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-6 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary shrink-0">
                            <FileAudio className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">
                                UGX 150,000{" "}
                                <span className="text-sm text-muted-foreground font-normal">
                                    per song
                                </span>
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                Includes the full mastered track + all individual
                                stems (vocals, instruments, drums). 50% deposit
                                optional to start production.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                {step === "form" && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-5"
                    >
                        {/* Name */}
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                                Your Name *
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your full name"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card/50 border border-border text-sm focus:border-primary/50 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                                Phone Number *
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="0704650600"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card/50 border border-border text-sm focus:border-primary/50 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                                Email (optional)
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card/50 border border-border text-sm focus:border-primary/50 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* Genre */}
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-2 block">
                                Preferred Genre
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {GENRES.map((g) => (
                                    <button
                                        key={g}
                                        onClick={() =>
                                            setGenre(g === genre ? "" : g)
                                        }
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                            g === genre
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                                Describe the music you want *
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={5}
                                placeholder="Describe the vibe, mood, tempo, purpose (e.g. wedding song, intro music, ad jingle), lyric themes, or any specific requirements..."
                                className="w-full px-4 py-3 rounded-xl bg-card/50 border border-border text-sm focus:border-primary/50 focus:outline-none transition-colors resize-none"
                            />
                        </div>

                        {/* Reference links */}
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                                Reference tracks (optional)
                            </label>
                            <div className="relative">
                                <Link2 className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                <textarea
                                    value={referenceLinks}
                                    onChange={(e) =>
                                        setReferenceLinks(e.target.value)
                                    }
                                    rows={2}
                                    placeholder="YouTube or Spotify links to songs with a similar vibe..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card/50 border border-border text-sm focus:border-primary/50 focus:outline-none transition-colors resize-none"
                                />
                            </div>
                        </div>

                        {/* Deposit option */}
                        <div className="rounded-xl border border-border p-5 space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={payDeposit}
                                    onChange={(e) =>
                                        setPayDeposit(e.target.checked)
                                    }
                                    className="w-4 h-4 rounded accent-primary"
                                />
                                <span className="text-sm font-medium">
                                    Pay 50% deposit now (UGX 75,000) to start
                                    production immediately
                                </span>
                            </label>

                            {payDeposit && (
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <button
                                        onClick={() =>
                                            setPaymentMethod("mtn_momo")
                                        }
                                        className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                                            paymentMethod === "mtn_momo"
                                                ? "border-yellow-500 bg-yellow-500/10 text-yellow-400"
                                                : "border-border text-muted-foreground"
                                        }`}
                                    >
                                        📱 MTN MoMo
                                    </button>
                                    <button
                                        onClick={() =>
                                            setPaymentMethod("airtel")
                                        }
                                        className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                                            paymentMethod === "airtel"
                                                ? "border-red-500 bg-red-500/10 text-red-400"
                                                : "border-border text-muted-foreground"
                                        }`}
                                    >
                                        📱 Airtel Money
                                    </button>
                                </div>
                            )}
                        </div>

                        {error && (
                            <p className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">
                                {error}
                            </p>
                        )}

                        <button
                            onClick={handleSubmit}
                            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]"
                        >
                            {payDeposit
                                ? "Submit & Pay UGX 75,000 Deposit"
                                : "Submit Commission Request"}
                        </button>
                    </motion.div>
                )}

                {/* Processing */}
                {step === "processing" && (
                    <div className="flex flex-col items-center py-16 gap-4">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">
                            Submitting your commission...
                        </p>
                    </div>
                )}

                {/* Manual payment instructions */}
                {step === "instructions" && result?.payment_info && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex flex-col items-center text-center gap-3 mb-6">
                            <CheckCircle className="w-14 h-14 text-emerald-400" />
                            <h2 className="text-xl font-bold">
                                Commission Submitted!
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Send the deposit to start production.
                            </p>
                        </div>

                        <div className="rounded-xl bg-primary/5 border border-primary/20 p-5 space-y-3">
                            <p className="text-sm font-medium">
                                Send deposit via{" "}
                                {result.payment_info.network}:
                            </p>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        To:
                                    </span>
                                    <span className="font-mono font-medium">
                                        {result.payment_info.phone}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Name:
                                    </span>
                                    <span className="font-medium">
                                        {result.payment_info.name}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Amount:
                                    </span>
                                    <span className="font-bold text-primary">
                                        UGX {result.deposit?.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        Reference:
                                    </span>
                                    <button
                                        onClick={copyRef}
                                        className="inline-flex items-center gap-1.5 font-mono font-bold text-primary"
                                    >
                                        {result.payment_info.reference}
                                        {copied ? (
                                            <Check className="w-3.5 h-3.5" />
                                        ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <Link
                            to="/"
                            className="block w-full py-3 rounded-xl border border-border text-sm font-medium text-center hover:bg-muted/50 transition-colors"
                        >
                            Back to Home
                        </Link>
                    </motion.div>
                )}

                {/* No-deposit success */}
                {step === "success" && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center py-16 gap-4 text-center"
                    >
                        <CheckCircle className="w-16 h-16 text-emerald-400" />
                        <h2 className="text-xl font-bold">
                            Commission Submitted!
                        </h2>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            {result?.message ??
                                "We'll contact you within 24 hours to discuss your project."}
                        </p>
                        <Link
                            to="/"
                            className="mt-4 px-6 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
                        >
                            Back to Home
                        </Link>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
