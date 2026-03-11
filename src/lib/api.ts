const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

type RequestOpts = {
    method?: string;
    body?: unknown;
    token?: string;
};

async function request<T>(endpoint: string, opts: RequestOpts = {}): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: opts.method ?? "GET",
        headers,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error ?? `HTTP ${res.status}`);
    }

    return res.json();
}

async function uploadFormData<T>(
    endpoint: string,
    formData: FormData,
    token: string
): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error ?? `HTTP ${res.status}`);
    }

    return res.json();
}

/* ── Types ────────────────────────────────────────────────────────── */
export type Song = {
    id: string;
    title: string;
    artist: string;
    genre: string;
    price: number;
    cover_art: string | null;
    duration: number;
    created_at: string;
    file_path?: string;
    preview_path?: string;
    is_active?: number;
};

export type Order = {
    id: string;
    song_id: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string | null;
    amount: number;
    payment_method: string;
    payment_ref: string | null;
    flw_ref: string | null;
    status: string;
    download_token: string;
    download_count: number;
    created_at: string;
    paid_at: string | null;
    song_title?: string;
    song_artist?: string;
};

export type Commission = {
    id: string;
    client_name: string;
    client_phone: string;
    client_email: string | null;
    description: string;
    genre: string | null;
    reference_links: string | null;
    amount: number;
    deposit_amount: number;
    payment_method: string | null;
    payment_ref: string | null;
    status: string;
    admin_notes: string | null;
    created_at: string;
};

export type OrderResponse = {
    order_id: string;
    payment_mode: "automated" | "manual";
    amount?: number;
    payment_info?: {
        phone: string;
        name: string;
        network: string;
        reference: string;
        instructions: string;
    };
    message: string;
};

export type CommissionResponse = {
    commission_id: string;
    payment_mode?: "automated" | "manual";
    deposit?: number;
    payment_info?: {
        phone: string;
        name: string;
        network: string;
        reference: string;
        instructions: string;
    };
    message: string;
};

/* ── API functions ────────────────────────────────────────────────── */
export const api = {
    /* Auth */
    login: (username: string, password: string) =>
        request<{ token: string; username: string }>("/auth/login", {
            method: "POST",
            body: { username, password },
        }),

    /* Songs (Public) */
    getSongs: () => request<Song[]>("/songs"),
    getSong: (id: string) => request<Song>(`/songs/${id}`),
    getPreviewUrl: (id: string) =>
        `${API_BASE}/songs/${id}/preview`,
    getCoverUrl: (coverArt: string | null) =>
        coverArt
            ? `${API_BASE.replace("/api", "")}/uploads/covers/${coverArt}`
            : null,

    /* Songs (Admin) */
    getAllSongs: (token: string) =>
        request<Song[]>("/songs/admin/all", { token }),
    uploadSong: (formData: FormData, token: string) =>
        uploadFormData<Song>("/songs", formData, token),
    updateSong: (id: string, data: Partial<Song>, token: string) =>
        request<Song>(`/songs/${id}`, { method: "PATCH", body: data, token }),
    deleteSong: (id: string, token: string) =>
        request<{ success: boolean }>(`/songs/${id}`, { method: "DELETE", token }),

    /* Orders */
    createOrder: (data: {
        song_id: string;
        customer_name: string;
        customer_phone: string;
        customer_email?: string;
        payment_method: string;
    }) => request<OrderResponse>("/orders", { method: "POST", body: data }),
    getOrders: (token: string) => request<Order[]>("/orders", { token }),
    approveOrder: (id: string, paymentRef: string, token: string) =>
        request<Order>(`/orders/${id}/approve`, {
            method: "PATCH",
            body: { payment_ref: paymentRef },
            token,
        }),
    rejectOrder: (id: string, token: string) =>
        request<{ success: boolean }>(`/orders/${id}/reject`, {
            method: "PATCH",
            token,
        }),

    /* Commissions */
    submitCommission: (data: {
        client_name: string;
        client_phone: string;
        client_email?: string;
        description: string;
        genre?: string;
        reference_links?: string;
        pay_deposit?: boolean;
        payment_method?: string;
    }) => request<CommissionResponse>("/commissions", { method: "POST", body: data }),
    getCommissions: (token: string) => request<Commission[]>("/commissions", { token }),
    updateCommission: (
        id: string,
        data: { status?: string; admin_notes?: string; payment_ref?: string },
        token: string
    ) => request<Commission>(`/commissions/${id}`, { method: "PATCH", body: data, token }),

    /* Downloads */
    getDownloadStatus: (token: string) =>
        request<{
            status: string;
            title: string;
            artist: string;
            downloads_remaining: number;
        }>(`/downloads/${token}/status`),
    getDownloadUrl: (token: string) => `${API_BASE}/downloads/${token}`,
};
