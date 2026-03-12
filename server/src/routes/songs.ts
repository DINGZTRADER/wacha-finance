import { Router } from "express";
import { v4 as uuid } from "uuid";
import { put } from "@vercel/blob";
import { db } from "../db.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import fileUpload from "express-fileupload";

const router = Router();

// Middleware for file uploads
router.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    abortOnLimit: true,
}));

/* ── Public: list active songs ───────────────────────────────────── */
router.get("/", async (_req, res) => {
    try {
        const songs = await db.all(
            `SELECT id, title, artist, genre, price, cover_art, duration, created_at
             FROM songs WHERE is_active = 1 ORDER BY created_at DESC`
        );
        res.json(songs);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch songs" });
    }
});

/* ── Public: stream preview audio ────────────────────────────────── */
router.get("/:id/preview", async (req, res) => {
    try {
        const song = await db.get("SELECT preview_path, file_path FROM songs WHERE id = $1 AND is_active = 1", [req.params.id]) as any;
        if (!song) {
            res.status(404).json({ error: "Song not found" });
            return;
        }

        const audioUrl = song.preview_path || song.file_path;
        if (!audioUrl) {
            res.status(404).json({ error: "Audio not found" });
            return;
        }

        // In production (Vercel), we redirect to the Blob URL or proxy it
        // For simplicity and speed, we redirect
        res.redirect(audioUrl);
    } catch (err) {
        res.status(500).json({ error: "Failed to load preview" });
    }
});

/* ── Admin: upload new song (Production) ─────────────────────────── */
router.post("/", requireAuth as any, async (req: AuthRequest, res) => {
    try {
        if (!req.files || !req.files.audio) {
            res.status(400).json({ error: "Audio file required" });
            return;
        }

        const audioFile = Array.isArray(req.files.audio) ? req.files.audio[0] : req.files.audio;
        const coverFile = req.files.cover ? (Array.isArray(req.files.cover) ? req.files.cover[0] : req.files.cover) : null;
        const previewFile = req.files.preview ? (Array.isArray(req.files.preview) ? req.files.preview[0] : req.files.preview) : null;

        const id = uuid();
        const { title, artist, genre, price } = req.body;

        // 1. Upload Full Audio to Blob
        const audioBlob = await put(`songs/${id}-${audioFile.name}`, audioFile.data, {
            access: 'public',
            contentType: audioFile.mimetype,
        });

        // 2. Upload Cover if exists
        let coverUrl = null;
        if (coverFile) {
            const coverBlob = await put(`covers/${id}-${coverFile.name}`, coverFile.data, {
                access: 'public',
                contentType: coverFile.mimetype,
            });
            coverUrl = coverBlob.url;
        }

        // 3. Upload Preview if exists
        let previewUrl = null;
        if (previewFile) {
            const previewBlob = await put(`previews/${id}-${previewFile.name}`, previewFile.data, {
                access: 'public',
                contentType: previewFile.mimetype,
            });
            previewUrl = previewBlob.url;
        }

        await db.run(
            `INSERT INTO songs (id, title, artist, genre, price, cover_art, file_path, preview_path)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                id,
                title || "Untitled",
                artist || "Peter Wacha",
                genre || "Afrobeat",
                parseInt(price) || 3000,
                coverUrl,
                audioBlob.url,
                previewUrl
            ]
        );

        const song = await db.get("SELECT * FROM songs WHERE id = $1", [id]);
        res.status(201).json(song);
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: "Upload failed" });
    }
});

/* ── Admin: update song ──────────────────────────────────────────── */
router.patch("/:id", requireAuth as any, async (req: AuthRequest, res) => {
    const { title, artist, genre, price, is_active } = req.body;
    try {
        await db.run(
            `UPDATE songs SET
                title = COALESCE($1, title),
                artist = COALESCE($2, artist),
                genre = COALESCE($3, genre),
                price = COALESCE($4, price),
                is_active = COALESCE($5, is_active)
             WHERE id = $6`,
            [title, artist, genre, price, is_active, req.params.id]
        );
        const song = await db.get("SELECT * FROM songs WHERE id = $1", [req.params.id]);
        res.json(song);
    } catch (err) {
        res.status(500).json({ error: "Failed to update song" });
    }
});

/* ── Admin: delete song ──────────────────────────────────────────── */
router.delete("/:id", requireAuth as any, async (req: AuthRequest, res) => {
    try {
        await db.run("UPDATE songs SET is_active = 0 WHERE id = $1", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete song" });
    }
});

/* ── Admin: list all songs ───────────────────────────────────────── */
router.get("/admin/all", requireAuth as any, async (_req, res) => {
    try {
        const songs = await db.all("SELECT * FROM songs ORDER BY created_at DESC");
        res.json(songs);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch songs" });
    }
});

export default router;
