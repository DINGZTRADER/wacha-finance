import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Phone, User, Mail, CheckCircle, Loader2, Copy, Check } from "lucide-react";
import type { Song, OrderResponse } from "@/lib/api";
import { api } from "@/lib/api";

type Props = {
    song: Song;
    onClose: () => void;
};

type Step = "details" | "processing" | "instructions" | "success";

export default function PaymentModal({ song, onClose }: Props) {
    const [step, setStep] = useState<Step>("details");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"mtn_momo" | "airtel">("mtn_momo");
    const [error, setError] = useState("");
    const [orderResult, setOrderResult] = useState<OrderResponse | null>(null);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim() || !phone.trim()) {
            setError("Name and phone number are required");
            return;
        }
        if (!/^0[37]\d{8}$/.test(phone.replace(/\s/g, ""))) {
            setError("Enter a valid Uganda phone number (e.g. 0704650600)");
            return;
        }

        setError("");
        setStep("processing");

        try {
            const result = await api.createOrder({
                song_id: song.id,
                customer_name: name,
                customer_phone: phone.replace(/\s/g, ""),
                customer_email: email || undefined,
                payment_method: paymentMethod,
            });
            setOrderResult(result);
            setStep(result.payment_mode === "automated" ? "success" : "instructions");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Payment failed");
            setStep("details");
        }
    };

    const copyRef = () => {
        if (orderResult?.payment_info?.reference) {
            navigator.clipboard.writeText(orderResult.payment_info.reference);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 md:p-8 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                        title="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Header */}
                    <div className="mb-6">
                        <h3 className="text-xl font-bold">Buy Track</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {song.title} — {song.artist}
                        </p>
                        <p className="text-2xl font-bold text-primary mt-2">
                            UGX {song.price.toLocaleString()}
                        </p>
                    </div>

                    {/* Step: Details form */}
                    {step === "details" && (
                        <div className="space-y-4">
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
                                        placeholder="Peter Wacha"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:border-primary/50 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

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
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:border-primary/50 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

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
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:border-primary/50 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Payment method */}
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                                    Payment Method
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setPaymentMethod("mtn_momo")}
                                        className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                                            paymentMethod === "mtn_momo"
                                                ? "border-yellow-500 bg-yellow-500/10 text-yellow-400"
                                                : "border-border text-muted-foreground hover:border-border/80"
                                        }`}
                                    >
                                        📱 MTN MoMo
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod("airtel")}
                                        className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                                            paymentMethod === "airtel"
                                                ? "border-red-500 bg-red-500/10 text-red-400"
                                                : "border-border text-muted-foreground hover:border-border/80"
                                        }`}
                                    >
                                        📱 Airtel Money
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">
                                    {error}
                                </p>
                            )}

                            <button
                                onClick={handleSubmit}
                                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]"
                            >
                                Pay UGX {song.price.toLocaleString()}
                            </button>
                        </div>
                    )}

                    {/* Step: Processing */}
                    {step === "processing" && (
                        <div className="flex flex-col items-center py-8 gap-4">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            <p className="text-sm text-muted-foreground">
                                Initiating payment...
                            </p>
                        </div>
                    )}

                    {/* Step: Manual payment instructions */}
                    {step === "instructions" && orderResult?.payment_info && (
                        <div className="space-y-5">
                            <div className="rounded-xl bg-primary/5 border border-primary/20 p-5 space-y-3">
                                <p className="text-sm font-medium">
                                    Send payment via {orderResult.payment_info.network}:
                                </p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">To:</span>
                                        <span className="font-mono font-medium">
                                            {orderResult.payment_info.phone}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Name:</span>
                                        <span className="font-medium">
                                            {orderResult.payment_info.name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Amount:</span>
                                        <span className="font-bold text-primary">
                                            UGX {orderResult.amount?.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Reference:</span>
                                        <button
                                            onClick={copyRef}
                                            className="inline-flex items-center gap-1.5 font-mono font-bold text-primary"
                                        >
                                            {orderResult.payment_info.reference}
                                            {copied ? (
                                                <Check className="w-3.5 h-3.5" />
                                            ) : (
                                                <Copy className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                After sending payment, your download link will be
                                activated within minutes. You'll be notified once confirmed.
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    )}

                    {/* Step: Automated payment success */}
                    {step === "success" && (
                        <div className="flex flex-col items-center py-6 gap-4 text-center">
                            <CheckCircle className="w-14 h-14 text-emerald-400" />
                            <div>
                                <p className="text-lg font-semibold">Payment Initiated!</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {orderResult?.message}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-full py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
