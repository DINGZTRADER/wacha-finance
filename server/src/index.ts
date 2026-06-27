import "dotenv/config";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import authRoutes from "./routes/auth.js";
import songRoutes from "./routes/songs.js";
import orderRoutes from "./routes/orders.js";
import commissionRoutes from "./routes/commissions.js";
import downloadRoutes from "./routes/downloads.js";
import paymentRoutes from "./routes/payments.js";
import videoRoutes from "./routes/video.js";
import { checkAndTrimVideos } from "./utils/videoTrimmer.js";
import financeRoutes from "./routes/finance.js";
import reportRoutes from "./routes/reports.js";


import db, { initDB } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT ?? "3001");

// Initialize DB
if (process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || !process.env.VERCEL) {
    initDB().catch(err => {
        console.error("DB Init Error:", err.message);
    });
}

// Run initial video size check/trim
checkAndTrimVideos().catch(err => {
    console.error("[Video Trimmer] Initial scan failed:", err.message);
});

/* ── Middleware ───────────────────────────────────────────────────── */
export const app = express();

app.use(cors({
    origin: [
        process.env.FRONTEND_URL ?? "http://localhost:5173",
        "http://localhost:5174",
        "https://wachaai.com",
        "https://www.wachaai.com"
    ],
    credentials: true,
}));
app.use(express.json());

// Serve cover art publicly
app.use(
    "/uploads/covers",
    express.static(path.join(__dirname, "..", "uploads", "covers"))
);

// Serve episodes publicly
app.use(
    "/episodes",
    express.static(path.join(__dirname, "..", "..", "movie", "episodes"))
);

// Get all video episodes dynamically
app.get("/api/episodes", async (_req, res) => {
    try {
        // Trigger background scan/trim check when episodes are requested
        checkAndTrimVideos().catch(err => {
            console.error("[Video Trimmer] Route-triggered scan failed:", err.message);
        });

        const episodesDir = path.join(__dirname, "..", "..", "movie", "episodes");
        const fallbackEpisodes = [
            { name: "MISSING IN KAMPALA #001 (1)", filename: "MISSING_IN_KAMPALA #001 (1).mp4", url: "/episodes/MISSING_IN_KAMPALA%20%23001%20(1).mp4" },
            { name: "MISSING IN KAMPALA #001 (2)", filename: "MISSING_IN_KAMPALA #001 (2).mp4", url: "/episodes/MISSING_IN_KAMPALA%20%23001%20(2).mp4" },
            { name: "MISSING IN KAMPALA #001 (3)", filename: "MISSING_IN_KAMPALA #001 (3).mp4", url: "/episodes/MISSING_IN_KAMPALA%20%23001%20(3).mp4" },
            { name: "MISSING IN KAMPALA #001 (4)", filename: "MISSING_IN_KAMPALA #001 (4).mp4", url: "/episodes/MISSING_IN_KAMPALA%20%23001%20(4).mp4" },
            { name: "MISSING IN KAMPALA #001 (5)", filename: "MISSING_IN_KAMPALA #001 (5).mp4", url: "/episodes/MISSING_IN_KAMPALA%20%23001%20(5).mp4" },
            { name: "Terminal Velocity", filename: "Terminal_Velocity.mp4", url: "/episodes/Terminal_Velocity.mp4" }
        ];
        if (!fs.existsSync(episodesDir)) {
            res.json(fallbackEpisodes);
            return;
        }
        const files = await fs.promises.readdir(episodesDir);
        const filteredFiles = files.filter(file => /\.(mp4|webm|mov|mkv)$/i.test(file));
        if (filteredFiles.length === 0) {
            res.json(fallbackEpisodes);
            return;
        }
        const videos = filteredFiles.map(file => ({
            name: file.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
            filename: file,
            url: `/episodes/${encodeURIComponent(file)}`
        }));
        res.json(videos);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

/* ── Routes ──────────────────────────────────────────────────────── */
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/commissions", commissionRoutes);
app.use("/api/downloads", downloadRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/reports", reportRoutes);


/* ── Health check ────────────────────────────────────────────────── */
app.get("/api/health", async (_req, res) => {
    const { isPostgres, connectionString } = await import("./db.js");
    res.json({
        status: "ok",
        time: new Date().toISOString(),
        database: isPostgres ? "Postgres" : "None/SQLite (Local Only)",
        setup_required: !isPostgres && !!process.env.VERCEL,
        env: {
            has_postgres_url: !!process.env.POSTGRES_URL || !!process.env.POSTGRES_PRISMA_URL,
            has_database_url: !!process.env.DATABASE_URL,
            node_env: process.env.NODE_ENV
        },
        payment_mode: process.env.FLW_SECRET_KEY ? "automated" : "manual",
    });
});

app.get("/api/debug-db", async (_req, res) => {
    try {
        const result = await db.query("SELECT COUNT(*) as count FROM songs");
        const genres = await db.query("SELECT DISTINCT genre FROM songs");
        res.json({
            count: result.rows[0].count,
            genres: genres.rows.map((r: any) => r.genre),
            isPostgres: (await import("./db.js")).isPostgres
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

/* ── Start ────────────────────────────────────────────────────────── */
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`\n  🎵 WachaAI Music API running on http://localhost:${PORT}`);
        console.log(`  📦 Payment mode: ${process.env.FLW_SECRET_KEY ? "Flutterwave (automated)" : "Manual MoMo"}`);
        console.log(`  💰 Recipient: ${process.env.PAYMENT_NETWORK} ${process.env.PAYMENT_PHONE} (${process.env.PAYMENT_NAME})\n`);
    });
}

export default app;
