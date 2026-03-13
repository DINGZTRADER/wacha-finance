import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";

import authRoutes from "./routes/auth.js";
import songRoutes from "./routes/songs.js";
import orderRoutes from "./routes/orders.js";
import commissionRoutes from "./routes/commissions.js";
import downloadRoutes from "./routes/downloads.js";
import paymentRoutes from "./routes/payments.js";

import { initDB } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT ?? "3001");

// Initialize DB
initDB().catch(console.error);

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

/* ── Routes ──────────────────────────────────────────────────────── */
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/commissions", commissionRoutes);
app.use("/api/downloads", downloadRoutes);
app.use("/api/payments", paymentRoutes);

/* ── Health check ────────────────────────────────────────────────── */
app.get("/api/health", async (_req, res) => {
    const { isPostgres } = await import("./db.js");
    res.json({
        status: "ok",
        time: new Date().toISOString(),
        database: isPostgres ? "Postgres" : "SQLite",
        env: {
            has_postgres_url: !!process.env.POSTGRES_URL,
            has_database_url: !!process.env.DATABASE_URL,
            node_env: process.env.NODE_ENV
        },
        payment_mode: process.env.FLW_SECRET_KEY ? "automated" : "manual",
    });
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

