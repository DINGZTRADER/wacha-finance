import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import {
    Download as DownloadIcon,
    CheckCircle,
    Clock,
    XCircle,
    Loader2,
    ArrowLeft,
    Music,
} from "lucide-react";
import { api } from "@/lib/api";

export default function Download() {
    const { token } = useParams<{ token: string }>();
    const [status, setStatus] = useState<{
        status: string;
        title: string;
        artist: string;
        downloads_remaining: number;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) return;
        api.getDownloadStatus(token)
            .then(setStatus)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (error || !status) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 px-6">
                <XCircle className="w-16 h-16 text-red-400" />
                <h1 className="text-2xl font-bold">Invalid Download Link</h1>
                <p className="text-muted-foreground text-center max-w-sm">
                    This link is invalid or has expired. If you believe this is
                    an error, contact support.
                </p>
                <Link
                    to="/"
                    className="mt-4 text-sm text-primary hover:brightness-125 font-medium"
                >
                    ← Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center space-y-6"
            >
                <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Home
                </Link>

                {status.status === "paid" ? (
                    <>
                        <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto" />
                        <div>
                            <h1 className="text-2xl font-bold">
                                Ready to Download
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                <strong>{status.title}</strong> by{" "}
                                {status.artist}
                            </p>
                        </div>

                        <a
                            href={api.getDownloadUrl(token!)}
                            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all hover:shadow-[0_0_30px_rgba(56,189,248,0.3)]"
                        >
                            <DownloadIcon className="w-5 h-5" />
                            Download Track
                        </a>

                        <p className="text-xs text-muted-foreground">
                            {status.downloads_remaining} download
                            {status.downloads_remaining !== 1 ? "s" : ""}{" "}
                            remaining
                        </p>
                    </>
                ) : status.status === "pending" ? (
                    <>
                        <Clock className="w-16 h-16 text-yellow-400 mx-auto" />
                        <div>
                            <h1 className="text-2xl font-bold">
                                Payment Pending
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                We're verifying your payment for{" "}
                                <strong>{status.title}</strong>. This usually
                                takes a few minutes.
                            </p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
                        >
                            Refresh Status
                        </button>
                    </>
                ) : (
                    <>
                        <XCircle className="w-16 h-16 text-red-400 mx-auto" />
                        <div>
                            <h1 className="text-2xl font-bold">
                                Download Unavailable
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                This order was not approved. Contact support if
                                you need help.
                            </p>
                        </div>
                    </>
                )}

                <div className="pt-4 border-t border-border">
                    <Link
                        to="/store"
                        className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:brightness-125"
                    >
                        <Music className="w-4 h-4" /> Browse More Music
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
