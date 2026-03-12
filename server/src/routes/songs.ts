import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { v4 as uuid } from "uuid";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");

// Ensure upload dirs
fs.mkdirSync(path.join(UPLOAD_DIR, "songs"), { recursive: true });
fs.mkdirSync(path.join(UPLOAD_DIR, "covers"), { recursive: true });
fs.mkdirSync(path.join(UPLOAD_DIR, "previews"), { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, file, cb) => {
        if (file.fieldname === "audio") cb(null, path.join(UPLOAD_DIR, "songs"));
        else if (file.fieldname === "cover") cb(null, path.join(UPLOAD_DIR, "covers"));
        else if (file.fieldname === "preview") cb(null, path.join(UPLOAD_DIR, "previews"));
        else cb(null, UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuid()}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (_req, file, cb) => {
        if (file.fieldname === "audio" && !file.mimetype.startsWith("audio/")) {
            cb(new Error("Only audio files allowed"));
            return;
        }
        if (file.fieldname === "cover" && !file.mimetype.startsWith("image/")) {
            cb(new Error("Only image files allowed"));
            return;
        }
        cb(null, true);
    },
});

const router = Router();

/* ── Public: list active songs ───────────────────────────────────── */
router.get("/", (_req, res) => {
    const songs = db
        .prepare(
            `SELECT id, title, artist, genre, price, cover_art, duration, created_at
             FROM songs WHERE is_active = 1 ORDER BY created_at DESC`
        )
        .all();
    res.json(songs);
});

/* ── Public: get single song ─────────────────────────────────────── */
router.get("/:id", (req, res) => {
    const song = db
        .prepare(
            `SELECT id, title, artist, genre, price, cover_art, duration, created_at
             FROM songs WHERE id = ? AND is_active = 1`
        )
        .get(req.params.id);
    if (!song) {
        res.status(404).json({ error: "Song not found" });
        return;
    }
    res.json(song);
});

/* ── Public: stream preview audio ────────────────────────────────── */
router.get("/:id/preview", (req, res) => {
    const song = db
        .prepare("SELECT preview_path, file_path FROM songs WHERE id = ? AND is_active = 1")
        .get(req.params.id) as { preview_path: string | null; file_path: string } | undefined;

    if (!song) {
        res.status(404).json({ error: "Song not found" });
        return;
    }

    const previewFile = song.preview_path
        ? path.join(UPLOAD_DIR, "previews", song.preview_path)
        : path.join(UPLOAD_DIR, "songs", song.file_path);

    if (!fs.existsSync(previewFile)) {
        res.status(404).json({ error: "Audio not found" });
        return;
    }

    const ext = path.extname(previewFile).toLowerCase();
    const mimeTypes: Record<string, string> = {
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".ogg": "audio/ogg",
        ".flac": "audio/flac",
        ".m4a": "audio/mp4",
    };
    const contentType = mimeTypes[ext] || "audio/mpeg";

    const stat = fs.statSync(previewFile);
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
        res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${stat.size}`,
            "Accept-Ranges": "bytes",
            "Content-Length": end - start + 1,
            "Content-Type": contentType,
        });
        fs.createReadStream(previewFile, { start, end }).pipe(res);
    } else {
        res.writeHead(200, {
            "Content-Length": stat.size,
            "Content-Type": contentType,
        });
        fs.createReadStream(previewFile).pipe(res);
    }
});

/* ── Admin: upload new song ──────────────────────────────────────── */
router.post(
    "/",
    requireAuth as any,
    upload.fields([
        { name: "audio", maxCount: 1 },
        { name: "cover", maxCount: 1 },
        { name: "preview", maxCount: 1 },
    ]),
    (req: AuthRequest, res) => {
        const files = req.files as Record<string, Express.Multer.File[]>;
        if (!files?.audio?.[0]) {
            res.status(400).json({ error: "Audio file required" });
            return;
        }

        const id = uuid();
        const { title, artist, genre, price } = req.body;

        db.prepare(
            `INSERT INTO songs (id, title, artist, genre, price, cover_art, file_path, preview_path)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
            id,
            title || "Untitled",
            artist || "Peter Wacha",
            genre || "Afrobeat",
            parseInt(price) || 3000,
            files.cover?.[0]?.filename ?? null,
            files.audio[0].filename,
            files.preview?.[0]?.filename ?? null
        );

        const song = db.prepare("SELECT * FROM songs WHERE id = ?").get(id);
        res.status(201).json(song);
    }
);

/* ── Admin: update song ──────────────────────────────────────────── */
router.patch("/:id", requireAuth as any, (req: AuthRequest, res) => {
    const { title, artist, genre, price, is_active } = req.body;
    const existing = db.prepare("SELECT * FROM songs WHERE id = ?").get(req.params.id);
    if (!existing) {
        res.status(404).json({ error: "Song not found" });
        return;
    }

    db.prepare(
        `UPDATE songs SET
            title = COALESCE(?, title),
            artist = COALESCE(?, artist),
            genre = COALESCE(?, genre),
            price = COALESCE(?, price),
            is_active = COALESCE(?, is_active)
         WHERE id = ?`
    ).run(title, artist, genre, price, is_active, req.params.id);

    const song = db.prepare("SELECT * FROM songs WHERE id = ?").get(req.params.id);
    res.json(song);
});

/* ── Admin: delete song ──────────────────────────────────────────── */
router.delete("/:id", requireAuth as any, (req: AuthRequest, res) => {
    db.prepare("UPDATE songs SET is_active = 0 WHERE id = ?").run(req.params.id);
    res.json({ success: true });
});

/* ── Admin: list all songs (including inactive) ──────────────────── */
router.get("/admin/all", requireAuth as any, (_req, res) => {
    const songs = db.prepare("SELECT * FROM songs ORDER BY created_at DESC").all();
    res.json(songs);
});

export default router;
