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
} from "lucide-react";
import { api, type Song, type Order, type Commission } from "@/lib/api";

type Props = {
    token: string;
    onLogout: () => void;
};

type Tab = "songs" | "orders" | "commissions";

export default function Dashboard({ token, onLogout }: Props) {
    const [tab, setTab] = useState<Tab>("orders");
    const [songs, setSongs] = useState<Song[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [commissions, setCommissions] = useState<Commission[]>([]);
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

    const refresh = async () => {
        setLoading(true);
        try {
            const [s, o, c] = await Promise.all([
                api.getAllSongs(token),
                api.getOrders(token),
                api.getCommissions(token),
            ]);
            setSongs(s);
            setOrders(o);
            setCommissions(c);
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

    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const newCommissions = commissions.filter((c) => c.status === "new").length;

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
            <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-3 gap-4">
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
            </div>

            {/* Tabs */}
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex gap-1 border-b border-border">
                    {(["orders", "songs", "commissions"] as Tab[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
                                tab === t
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {t}
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
                                            className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary/50 focus:outline-none"
                                        />
                                        <input
                                            type="text"
                                            value={uploadArtist}
                                            onChange={(e) =>
                                                setUploadArtist(e.target.value)
                                            }
                                            placeholder="Artist"
                                            className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary/50 focus:outline-none"
                                        />
                                        <input
                                            type="text"
                                            value={uploadGenre}
                                            onChange={(e) =>
                                                setUploadGenre(e.target.value)
                                            }
                                            placeholder="Genre"
                                            className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary/50 focus:outline-none"
                                        />
                                        <input
                                            type="number"
                                            value={uploadPrice}
                                            onChange={(e) =>
                                                setUploadPrice(e.target.value)
                                            }
                                            placeholder="Price (UGX)"
                                            className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary/50 focus:outline-none"
                                        />
                                        <input
                                            type="text"
                                            value={uploadSunoEmbed}
                                            onChange={(e) =>
                                                setUploadSunoEmbed(e.target.value)
                                            }
                                            placeholder="Suno Embed (Iframe or URL)"
                                            className="col-span-1 sm:col-span-2 px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary/50 focus:outline-none"
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
                    </>
                )}
            </div>
        </div>
    );
}
