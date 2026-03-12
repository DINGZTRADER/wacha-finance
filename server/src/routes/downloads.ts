import { Router } from "express";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import db from "../db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");

const router = Router();

/**
 * Protected download endpoint.
 * Only works with a valid download token from a paid order.
 * Limits downloads to 5 per token.
 */
router.get("/:token", (req, res) => {
    const order = db
        .prepare(
            `SELECT o.*, s.file_path, s.title, s.artist
             FROM orders o JOIN songs s ON o.song_id = s.id
             WHERE o.download_token = ?`
        )
        .get(req.params.token) as any;

    if (!order) {
        res.status(404).json({ error: "Invalid download link" });
        return;
    }

    if (order.status !== "paid") {
        res.status(403).json({
            error: "Payment not yet confirmed",
            status: order.status,
            message:
                order.status === "pending"
                    ? "Your payment is being verified. You'll receive your download link once confirmed."
                    : "This order has been rejected.",
        });
        return;
    }

    if (order.download_count >= 5) {
        res.status(403).json({
            error: "Download limit reached",
            message: "This download link has been used the maximum number of times (5). Contact support for help.",
        });
        return;
    }

    const filePath = path.join(UPLOAD_DIR, "songs", order.file_path);
    if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: "File not found on server" });
        return;
    }

    // Increment download count
    db.prepare("UPDATE orders SET download_count = download_count + 1 WHERE id = ?").run(order.id);

    // Sanitize filename
    const ext = path.extname(order.file_path);
    const safeName = `${order.artist} - ${order.title}`.replace(/[^a-zA-Z0-9\s\-_.]/g, "") + ext;

    const mimes: Record<string, string> = {
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".ogg": "audio/ogg",
        ".flac": "audio/flac",
        ".m4a": "audio/mp4",
    };
    const contentType = mimes[ext.toLowerCase()] || "audio/mpeg";

    res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
    res.setHeader("Content-Type", contentType);
    fs.createReadStream(filePath).pipe(res);
});

/* ── Check download status (no auth required, uses token) ────────── */
router.get("/:token/status", (req, res) => {
    const order = db
        .prepare(
            `SELECT o.status, o.download_count, s.title, s.artist
             FROM orders o JOIN songs s ON o.song_id = s.id
             WHERE o.download_token = ?`
        )
        .get(req.params.token) as any;

    if (!order) {
        res.status(404).json({ error: "Invalid link" });
        return;
    }

    res.json({
        status: order.status,
        title: order.title,
        artist: order.artist,
        downloads_remaining: Math.max(0, 5 - order.download_count),
    });
});

export default router;
