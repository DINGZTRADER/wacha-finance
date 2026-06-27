import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Music,
    ShoppingCart,
    Mic2,
    LogOut,
    Upload,
    RefreshCw,
    CheckCircle,
    XCircle,
    Loader2,
    Trash2,
    TrendingUp,
    TrendingDown,
    DollarSign,
    FileText,
    Mail,
    AlertCircle,
    DownloadCloud
} from "lucide-react";
import { api, type Song, type Order, type Commission, type Transaction } from "@/lib/api";

type Props = {
    token: string;
    onLogout: () => void;
};

type Tab = "orders" | "songs" | "commissions" | "finance";

export default function Dashboard({ token, onLogout }: Props) {
    const [tab, setTab] = useState<Tab>("orders");
    const [songs, setSongs] = useState<Song[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    /* Upload state */
    const [uploading, setUploading] = useState(false);
    const [uploadTitle, setUploadTitle] = useState("");
    const [uploadArtist, setUploadArtist] = useState("Peter Wacha");
    const [uploadGenre, setUploadGenre] = useState("Afrobeat");
    const [uploadPrice, setUploadPrice] = useState("3000");
    const [uploadSunoEmbed, setUploadSunoEmbed] = useState("");
    const [uploadAudio, setUploadAudio] = useState<File | null>(null);
    const [uploadCover, setUploadCover] = useState<File | null>(null);

    /* Financial manual processing / document ingest state */
    const [ingestFileUrl, setIngestFileUrl] = useState("");
    const [ingesting, setIngesting] = useState(false);
    const [triggeringReport, setTriggeringReport] = useState(false);

    // Selected receipt state for side-by-side audit modal
    const [auditTransaction, setAuditTransaction] = useState<Transaction | null>(null);

    const refresh = async () => {
        setLoading(true);
        try {
            const [s, o, c, t] = await Promise.all([
                api.getAllSongs(token),
                api.getOrders(token),
                api.getCommissions(token),
                api.getTransactions(token),
            ]);
            setSongs(s);
            setOrders(o);
            setCommissions(c);
            setTransactions(t);
        } catch {
            /* token expired */
        }
        setLoading(false);
    };

    useEffect(() => {
        refresh();
    }, [token]);

    const handleUpload = async () => {
        if (!uploadTitle.trim() || (!uploadAudio && !uploadSunoEmbed.trim())) return;
        setUploading(true);
        const fd = new FormData();
        if (uploadAudio) fd.append("audio", uploadAudio);
        if (uploadCover) fd.append("cover", uploadCover);
        fd.append("title", uploadTitle);
        fd.append("artist", uploadArtist);
        fd.append("genre", uploadGenre);
        fd.append("price", uploadPrice);
        if (uploadSunoEmbed) fd.append("suno_embed", uploadSunoEmbed);

        try {
            await api.uploadSong(fd, token);
            setUploadTitle("");
            setUploadSunoEmbed("");
            setUploadAudio(null);
            setUploadCover(null);
            refresh();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Upload failed");
        }
        setUploading(false);
    };

    const approveOrder = async (id: string) => {
        const ref = prompt("Payment reference (or leave blank for manual-verified):");
        await api.approveOrder(id, ref ?? "manual-verified", token);
        refresh();
    };

    const rejectOrder = async (id: string) => {
        if (!confirm("Reject this order?")) return;
        await api.rejectOrder(id, token);
        refresh();
    };

    const deleteSong = async (id: string) => {
        if (!confirm("Deactivate this song?")) return;
        await api.deleteSong(id, token);
        refresh();
    };

    const updateCommission = async (id: string, status: string) => {
        const notes = prompt("Add notes (optional):");
        await api.updateCommission(id, { status, admin_notes: notes ?? undefined }, token);
        refresh();
    };

    const handleProcessDocument = async () => {
        if (!ingestFileUrl.trim()) return;
        setIngesting(true);
        try {
            const res = await api.processDocument(ingestFileUrl);
            if (res.success) {
                alert(`Successfully processed document! Total Extracted Amount: UGX ${res.totalAmount.toLocaleString()}`);
                setIngestFileUrl("");
                refresh();
            } else if (res.duplicate) {
                alert("Duplicate invoice/receipt detected. Entry skipped.");
            } else {
                alert("Document parsing failed.");
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : "Document ingestion pipeline failed");
        }
        setIngesting(false);
    };

    const handleDeleteTransaction = async (id: string) => {
        if (!confirm("Are you sure you want to permanently delete this financial ledger transaction?")) return;
        try {
            await api.deleteTransaction(id, token);
            refresh();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Deletion failed");
        }
    };

    const handleManualDispatchReport = async () => {
        if (!confirm("Trigger immediate financial email digest dispatch to wachaexperience@gmail.com and masspolovisuals@gmail.com?")) return;
        setTriggeringReport(true);
        try {
            const res = await api.triggerWeeklyReportDigest(token);
            if (res.success) {
                alert(`Report generated and dispatched! Net profit calculated: UGX ${res.summary.netProfit.toLocaleString()}. Sent to: ${res.sentTo.join(", ")}`);
            } else {
                alert("Report compilation succeeded but email delivery bypassed/failed.");
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : "Digest trigger failed");
        }
        setTriggeringReport(false);
    };

    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const newCommissions = commissions.filter((c) => c.status === "new").length;

    // Financial KPI aggregation stats
    const totalRevenue = transactions
        .filter((t) => t.type === "revenue")
        .reduce((sum, t) => sum + parseFloat(t.total_amount as any || 0), 0);
    const totalExpenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + parseFloat(t.total_amount as any || 0), 0);
    const netProfit = totalRevenue - totalExpenses;

    const statusBadge = (status: string) => {
        const colors: Record<string, string> = {
            pending: "bg-yellow-500/10 text-yellow-400",
            paid: "bg-emerald-500/10 text-emerald-400",
            rejected: "bg-red-500/10 text-red-400",
            new: "bg-blue-500/10 text-blue-400",
            in_progress: "bg-violet-500/10 text-violet-400",
            deposit_paid: "bg-emerald-500/10 text-emerald-400",
            fully_paid: "bg-emerald-500/10 text-emerald-400",
            delivered: "bg-primary/10 text-primary",
        };
        return (
            <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    colors[status] ?? "bg-muted text-muted-foreground"
                }`}
            >
                {status.replace("_", " ")}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Top bar */}
            <div className="border-b border-border">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="text-xl font-bold">
                        Wacha<span className="text-primary">AI</span>{" "}
                        <span className="text-xs text-muted-foreground font-normal ml-1">
                            Admin
                        </span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={refresh}
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onLogout}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        >
                            <LogOut className="w-4 h-4" /> Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-border bg-card/50 p-5">
                    <Music className="w-5 h-5 text-primary mb-2" />
                    <div className="text-2xl font-bold">{songs.length}</div>
                    <div className="text-xs text-muted-foreground">Songs</div>
                </div>
                <div className="rounded-xl border border-border bg-card/50 p-5">
                    <ShoppingCart className="w-5 h-5 text-yellow-400 mb-2" />
                    <div className="text-2xl font-bold">
                        {pendingOrders}
                        <span className="text-sm text-muted-foreground font-normal">
                            /{orders.length}
                        </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Pending Orders
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-card/50 p-5">
                    <Mic2 className="w-5 h-5 text-violet-400 mb-2" />
                    <div className="text-2xl font-bold">
                        {newCommissions}
                        <span className="text-sm text-muted-foreground font-normal">
                            /{commissions.length}
                        </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        New Commissions
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-card/50 p-5">
                    <DollarSign className="w-5 h-5 text-emerald-400 mb-2" />
                    <div className="text-xl font-bold">
                        UGX {netProfit.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        30D Net Profits
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex gap-1 border-b border-border">
                    {(["orders", "songs", "commissions", "finance"] as Tab[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
                                tab === t
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {t === "finance" ? "Financial Ledger" : t}
                            {t === "orders" && pendingOrders > 0 && (
                                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px]">
                                    {pendingOrders}
                                </span>
                            )}
                            {t === "commissions" && newCommissions > 0 && (
                                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px]">
                                    {newCommissions}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-6 py-6">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* ── ORDERS TAB ─────────────────────────── */}
                        {tab === "orders" && (
                            <div className="space-y-3">
                                {orders.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-12">
                                        No orders yet.
                                    </p>
                                ) : (
                                    orders.map((o) => (
                                        <div
                                            key={o.id}
                                            className="rounded-xl border border-border bg-card/50 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold truncate">
                                                        {o.song_title}
                                                    </span>
                                                    {statusBadge(o.status)}
                                                </div>
                                                <div className="text-xs text-muted-foreground space-y-0.5">
                                                    <p>
                                                        {o.customer_name} •{" "}
                                                        {o.customer_phone}
                                                    </p>
                                                    <p>
                                                        UGX{" "}
                                                        {o.amount.toLocaleString()}{" "}
                                                        via {o.payment_method} •{" "}
                                                        {new Date(
                                                            o.created_at
                                                        ).toLocaleDateString()}
                                                    </p>
                                                    {o.payment_ref && (
                                                        <p className="font-mono">
                                                            Ref: {o.payment_ref}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {o.status === "pending" && (
                                                <div className="flex gap-2 shrink-0">
                                                    <button
                                                        onClick={() =>
                                                            approveOrder(o.id)
                                                        }
                                                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                                                    >
                                                        <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            rejectOrder(o.id)
                                                        }
                                                        className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors"
                                                    >
                                                        <XCircle className="w-3.5 h-3.5 inline mr-1" />
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* ── SONGS TAB ──────────────────────────── */}
                        {tab === "songs" && (
                            <div className="space-y-6">
                                {/* Upload form */}
                                <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-6 space-y-4">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Upload className="w-4 h-4 text-primary" />{" "}
                                        Upload New Song
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            value={uploadTitle}
                                            onChange={(e) =>
                                                setUploadTitle(e.target.value)
                                            }
                                            placeholder="Song title *"
                                            className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary/50 focus:outline-none text-foreground"
                                        />
                                        <input
                                            type="text"
                                            value={uploadArtist}
                                            onChange={(e) =>
                                                setUploadArtist(e.target.value)
                                            }
                                            placeholder="Artist"
                                            className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary/50 focus:outline-none text-foreground"
                                        />
                                        <input
                                            type="text"
                                            value={uploadGenre}
                                            onChange={(e) =>
                                                setUploadGenre(e.target.value)
                                            }
                                            placeholder="Genre"
                                            className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary/50 focus:outline-none text-foreground"
                                        />
                                        <input
                                            type="number"
                                            value={uploadPrice}
                                            onChange={(e) =>
                                                setUploadPrice(e.target.value)
                                            }
                                            placeholder="Price (UGX)"
                                            className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary/50 focus:outline-none text-foreground"
                                        />
                                        <input
                                            type="text"
                                            value={uploadSunoEmbed}
                                            onChange={(e) =>
                                                setUploadSunoEmbed(e.target.value)
                                            }
                                            placeholder="Suno Embed (Iframe or URL)"
                                            className="col-span-1 sm:col-span-2 px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary/50 focus:outline-none text-foreground"
                                        />
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <label className="flex-1 cursor-pointer">
                                            <span className="text-xs text-muted-foreground mb-1 block">
                                                Audio file *
                                            </span>
                                            <input
                                                type="file"
                                                accept="audio/*"
                                                onChange={(e) =>
                                                    setUploadAudio(
                                                        e.target.files?.[0] ??
                                                            null
                                                    )
                                                }
                                                className="text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-medium file:text-xs"
                                            />
                                        </label>
                                        <label className="flex-1 cursor-pointer">
                                            <span className="text-xs text-muted-foreground mb-1 block">
                                                Cover art (optional)
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) =>
                                                    setUploadCover(
                                                        e.target.files?.[0] ??
                                                            null
                                                    )
                                                }
                                                className="text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-medium file:text-xs"
                                            />
                                        </label>
                                    </div>
                                    <button
                                        onClick={handleUpload}
                                        disabled={
                                            uploading ||
                                            (!uploadAudio && !uploadSunoEmbed.trim()) ||
                                            !uploadTitle.trim()
                                        }
                                        className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-2"
                                    >
                                        {uploading && (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        )}
                                        Upload Song
                                    </button>
                                </div>

                                {/* Song list */}
                                <div className="space-y-3">
                                    {songs.map((s) => (
                                        <div
                                            key={s.id}
                                            className={`rounded-xl border bg-card/50 p-4 flex items-center gap-4 ${
                                                s.is_active
                                                    ? "border-border"
                                                    : "border-red-500/20 opacity-50"
                                            }`}
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                <Music className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">
                                                    {s.title}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {s.artist} • {s.genre} •
                                                    UGX{" "}
                                                    {s.price.toLocaleString()}
                                                    {!s.is_active &&
                                                        " • INACTIVE"}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    deleteSong(s.id)
                                                }
                                                className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                title="Deactivate"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── COMMISSIONS TAB ───────────────────── */}
                        {tab === "commissions" && (
                            <div className="space-y-3">
                                {commissions.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-12">
                                        No commission requests yet.
                                    </p>
                                ) : (
                                    commissions.map((c) => (
                                        <div
                                            key={c.id}
                                            className="rounded-xl border border-border bg-card/50 p-5 space-y-3"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold">
                                                            {c.client_name}
                                                        </span>
                                                        {statusBadge(c.status)}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {c.client_phone}
                                                        {c.client_email &&
                                                            ` • ${c.client_email}`}{" "}
                                                        •{" "}
                                                        {new Date(
                                                            c.created_at
                                                        ).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="text-sm font-bold text-primary">
                                                        UGX{" "}
                                                        {c.amount.toLocaleString()}
                                                    </div>
                                                    {c.deposit_amount > 0 && (
                                                        <div className="text-[10px] text-muted-foreground">
                                                            Deposit: UGX{" "}
                                                            {c.deposit_amount.toLocaleString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {c.genre && (
                                                <span className="inline-block px-2 py-0.5 rounded-full bg-muted text-[10px] text-muted-foreground">
                                                    {c.genre}
                                                </span>
                                            )}

                                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                {c.description}
                                            </p>

                                            {c.reference_links && (
                                                <p className="text-xs text-primary break-all">
                                                    Refs: {c.reference_links}
                                                </p>
                                            )}

                                            {c.admin_notes && (
                                                <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-3">
                                                    Notes: {c.admin_notes}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {c.status === "new" && (
                                                    <button
                                                        onClick={() =>
                                                            updateCommission(
                                                                c.id,
                                                                "in_progress"
                                                            )
                                                        }
                                                        className="px-3 py-1 rounded-lg bg-violet-500/10 text-violet-400 text-xs font-medium hover:bg-violet-500/20"
                                                    >
                                                        Start Working
                                                    </button>
                                                )}
                                                {(c.status === "new" ||
                                                    c.status ===
                                                        "in_progress") && (
                                                    <button
                                                        onClick={() =>
                                                            updateCommission(
                                                                c.id,
                                                                "deposit_paid"
                                                            )
                                                        }
                                                        className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20"
                                                    >
                                                        Mark Deposit Paid
                                                    </button>
                                                )}
                                                {c.status !== "delivered" && (
                                                    <button
                                                        onClick={() =>
                                                            updateCommission(
                                                                c.id,
                                                                "delivered"
                                                            )
                                                        }
                                                        className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20"
                                                    >
                                                        Mark Delivered
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* ── FINANCE LEDGER TAB ───────────────────── */}
                        {tab === "finance" && (
                            <div className="space-y-6">
                                {/* Dashboard Analytics Grid cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] p-5 flex items-center justify-between">
                                        <div>
                                            <span className="text-xs text-muted-foreground block mb-1">Total Revenue</span>
                                            <strong className="text-xl font-bold text-emerald-400">UGX {totalRevenue.toLocaleString()}</strong>
                                        </div>
                                        <TrendingUp className="w-6 h-6 text-emerald-400 opacity-60" />
                                    </div>
                                    <div className="rounded-xl border border-red-500/20 bg-red-500/[0.02] p-5 flex items-center justify-between">
                                        <div>
                                            <span className="text-xs text-muted-foreground block mb-1">Total Expenses</span>
                                            <strong className="text-xl font-bold text-red-400">UGX {totalExpenses.toLocaleString()}</strong>
                                        </div>
                                        <TrendingDown className="w-6 h-6 text-red-400 opacity-60" />
                                    </div>
                                    <div className="rounded-xl border border-primary/20 bg-primary/[0.02] p-5 flex items-center justify-between">
                                        <div>
                                            <span className="text-xs text-muted-foreground block mb-1">Net Balance</span>
                                            <strong className={`text-xl font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                UGX {netProfit.toLocaleString()}
                                            </strong>
                                        </div>
                                        <DollarSign className="w-6 h-6 text-primary opacity-60" />
                                    </div>
                                </div>

                                {/* Automated pipeline & control controls */}
                                <div className="rounded-xl border border-border bg-card/40 p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                                    <div className="flex-1 space-y-2">
                                        <h3 className="font-semibold text-md flex items-center gap-2">
                                            <DownloadCloud className="w-5 h-5 text-primary" />
                                            Document Ingestion Pipeline
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Paste an invoice or receipt URL to trigger automated Gemini 2.5 Flash data extraction. Normalizes values, checks for duplicates, and appends to the financial ledger database dynamically.
                                        </p>
                                        <div className="flex gap-2 w-full max-w-xl">
                                            <input
                                                type="text"
                                                value={ingestFileUrl}
                                                onChange={(e) => setIngestFileUrl(e.target.value)}
                                                placeholder="Paste document/image asset URL..."
                                                className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary/50 text-foreground"
                                            />
                                            <button
                                                onClick={handleProcessDocument}
                                                disabled={ingesting || !ingestFileUrl.trim()}
                                                className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:brightness-110 disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {ingesting && <Loader2 className="w-3 h-3 animate-spin" />}
                                                Process Document
                                            </button>
                                        </div>
                                    </div>
                                    <div className="shrink-0 space-y-2">
                                        <h4 className="font-semibold text-xs text-muted-foreground">Weekly Reporting Engine</h4>
                                        <button
                                            onClick={handleManualDispatchReport}
                                            disabled={triggeringReport}
                                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold rounded-lg transition-colors"
                                        >
                                            {triggeringReport ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                                            Dispatch Weekly Digest Email
                                        </button>
                                    </div>
                                </div>

                                {/* Audit ledger activity logs table */}
                                <div className="border border-border rounded-xl overflow-hidden bg-card/30">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-border bg-muted/20 text-xs text-muted-foreground font-semibold uppercase">
                                                    <th className="p-4">Date</th>
                                                    <th className="p-4">Vendor / Client</th>
                                                    <th className="p-4">Type</th>
                                                    <th className="p-4">Payment Format</th>
                                                    <th className="p-4">Invoice / Receipt No</th>
                                                    <th className="p-4 text-right">Subtotal</th>
                                                    <th className="p-4 text-right">VAT</th>
                                                    <th className="p-4 text-right">Total Amount</th>
                                                    <th className="p-4 text-center">Compliance</th>
                                                    <th className="p-4 text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border text-sm">
                                                {transactions.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={10} className="p-8 text-center text-muted-foreground">
                                                            No transactions recorded in the ledger.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    transactions.map((t) => {
                                                        const isRevenue = t.type === "revenue";
                                                        const complianceIssue = !t.tin_number; // Compliance flag when TIN number is missing

                                                        return (
                                                            <tr key={t.id} className="hover:bg-muted/10 transition-colors">
                                                                <td className="p-4 text-xs font-mono">
                                                                    {new Date(t.date).toLocaleDateString("en-UG", {
                                                                        year: "numeric",
                                                                        month: "short",
                                                                        day: "numeric"
                                                                    })}
                                                                </td>
                                                                <td className="p-4 font-medium max-w-[150px] truncate">{t.vendor_client_name}</td>
                                                                <td className="p-4">
                                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                                        isRevenue ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                                                                    }`}>
                                                                        {t.type}
                                                                    </span>
                                                                </td>
                                                                <td className="p-4 text-xs text-muted-foreground capitalize">
                                                                    {t.payment_format.replace("_", " ")}
                                                                </td>
                                                                <td className="p-4 text-xs font-mono">{t.invoice_receipt_no || "-"}</td>
                                                                <td className="p-4 text-right font-mono text-xs">
                                                                    {t.currency} {Number(t.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                                </td>
                                                                <td className="p-4 text-right font-mono text-xs text-muted-foreground">
                                                                    {t.currency} {Number(t.vat_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                                </td>
                                                                <td className="p-4 text-right font-bold font-mono text-xs">
                                                                    {t.currency} {Number(t.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                                </td>
                                                                <td className="p-4 text-center">
                                                                    {complianceIssue ? (
                                                                        <span className="inline-flex items-center gap-1 text-yellow-400" title="Compliance warning: Missing TIN Number">
                                                                            <AlertCircle className="w-4 h-4" />
                                                                            <span className="text-[10px] font-medium hidden sm:inline">Missing TIN</span>
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-emerald-400 text-xs font-medium">Compliant</span>
                                                                    )}
                                                                </td>
                                                                <td className="p-4">
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        {t.file_url && (
                                                                            <button
                                                                                onClick={() => setAuditTransaction(t)}
                                                                                className="p-1 text-primary hover:bg-primary/10 rounded"
                                                                                title="Audit Document File"
                                                                            >
                                                                                <FileText className="w-4 h-4" />
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            onClick={() => handleDeleteTransaction(t.id)}
                                                                            className="p-1 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded"
                                                                            title="Delete ledger record"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Side-by-side Audit modal */}
            {auditTransaction && (
                <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 md:p-8 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-card border border-border w-full max-w-6xl h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/10">
                            <div>
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <FileText className="text-primary w-5 h-5" />
                                    Transaction Audit Check
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Compare extracted metadata side-by-side against the original uploaded invoice/receipt document.
                                </p>
                            </div>
                            <button
                                onClick={() => setAuditTransaction(null)}
                                className="px-3 py-1.5 rounded-lg hover:bg-muted text-sm transition-colors text-muted-foreground hover:text-foreground"
                            >
                                Close Audit
                            </button>
                        </div>
                        
                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-border">
                            {/* Left Pane: Extracted Info Summary Form */}
                            <div className="w-full md:w-2/5 p-6 overflow-y-auto space-y-6">
                                <h4 className="font-bold text-xs uppercase text-muted-foreground tracking-wider border-b border-border pb-2">Extracted Metadata Ledger</h4>
                                <div className="space-y-4 text-sm">
                                    <div className="grid grid-cols-2 gap-2 border-b border-border/40 pb-2">
                                        <span className="text-muted-foreground">Record ID:</span>
                                        <span className="font-mono text-xs truncate" title={auditTransaction.id}>{auditTransaction.id}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 border-b border-border/40 pb-2">
                                        <span className="text-muted-foreground">Flow Type:</span>
                                        <span className="font-semibold capitalize text-foreground">{auditTransaction.type}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 border-b border-border/40 pb-2">
                                        <span className="text-muted-foreground">Transaction Date:</span>
                                        <span>{new Date(auditTransaction.date).toDateString()}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 border-b border-border/40 pb-2">
                                        <span className="text-muted-foreground">Vendor/Client:</span>
                                        <span className="font-semibold text-foreground">{auditTransaction.vendor_client_name}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 border-b border-border/40 pb-2">
                                        <span className="text-muted-foreground">TIN Number:</span>
                                        <span className={auditTransaction.tin_number ? "" : "text-yellow-400 font-medium"}>
                                            {auditTransaction.tin_number || "Missing TIN (Non-compliant)"}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 border-b border-border/40 pb-2">
                                        <span className="text-muted-foreground">Invoice/Receipt No:</span>
                                        <span className="font-mono">{auditTransaction.invoice_receipt_no || "-"}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 border-b border-border/40 pb-2">
                                        <span className="text-muted-foreground">Payment Format:</span>
                                        <span className="capitalize">{auditTransaction.payment_format.replace("_", " ")}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 border-b border-border/40 pb-2">
                                        <span className="text-muted-foreground">Base Subtotal:</span>
                                        <span className="font-mono font-semibold">{auditTransaction.currency} {Number(auditTransaction.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 border-b border-border/40 pb-2">
                                        <span className="text-muted-foreground">VAT Amount:</span>
                                        <span className="font-mono text-muted-foreground">{auditTransaction.currency} {Number(auditTransaction.vat_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 border-t-2 border-border pt-3">
                                        <span className="font-bold text-foreground">Total Ingested:</span>
                                        <span className="font-mono font-bold text-primary text-base">
                                            {auditTransaction.currency} {Number(auditTransaction.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Right Pane: PDF / Image Embed preview */}
                            <div className="w-full md:w-3/5 h-full bg-black/20 flex flex-col justify-between overflow-hidden">
                                <div className="flex-1 p-2 flex items-center justify-center overflow-hidden">
                                    {auditTransaction.file_url ? (
                                        auditTransaction.file_url.toLowerCase().endsWith(".pdf") ? (
                                            <iframe
                                                src={auditTransaction.file_url}
                                                className="w-full h-full border-0 rounded-lg"
                                                title="PDF Preview"
                                            />
                                        ) : (
                                            <img
                                                src={auditTransaction.file_url}
                                                alt="Receipt Invoice Preview"
                                                className="max-w-full max-h-full object-contain rounded-lg shadow"
                                            />
                                        )
                                    ) : (
                                        <p className="text-muted-foreground text-sm">No preview format available.</p>
                                    )}
                                </div>
                                <div className="p-3 border-t border-border bg-muted/20 text-center flex justify-between items-center px-6">
                                    <span className="text-xs text-muted-foreground truncate max-w-sm" title={auditTransaction.file_url || ""}>
                                        Source: {auditTransaction.file_url}
                                    </span>
                                    <a
                                        href={auditTransaction.file_url || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary font-semibold hover:underline"
                                    >
                                        Open in New Tab
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
