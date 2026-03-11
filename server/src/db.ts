import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "data", "music.db");

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

/* ------------------------------------------------------------------ */
/* Schema                                                              */
/* ------------------------------------------------------------------ */
db.exec(`
    CREATE TABLE IF NOT EXISTS songs (
        id          TEXT PRIMARY KEY,
        title       TEXT NOT NULL,
        artist      TEXT NOT NULL DEFAULT 'Peter Wacha',
        genre       TEXT NOT NULL DEFAULT 'Afrobeat',
        price       INTEGER NOT NULL DEFAULT 3000,
        cover_art   TEXT,
        file_path   TEXT NOT NULL,
        preview_path TEXT,
        duration    INTEGER DEFAULT 0,
        created_at  TEXT NOT NULL DEFAULT (datetime('now')),
        is_active   INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS orders (
        id              TEXT PRIMARY KEY,
        song_id         TEXT NOT NULL,
        customer_name   TEXT NOT NULL,
        customer_phone  TEXT NOT NULL,
        customer_email  TEXT,
        amount          INTEGER NOT NULL,
        payment_method  TEXT NOT NULL DEFAULT 'mtn_momo',
        payment_ref     TEXT,
        flw_ref         TEXT,
        status          TEXT NOT NULL DEFAULT 'pending',
        download_token  TEXT,
        download_count  INTEGER NOT NULL DEFAULT 0,
        created_at      TEXT NOT NULL DEFAULT (datetime('now')),
        paid_at         TEXT,
        FOREIGN KEY (song_id) REFERENCES songs(id)
    );

    CREATE TABLE IF NOT EXISTS commissions (
        id              TEXT PRIMARY KEY,
        client_name     TEXT NOT NULL,
        client_phone    TEXT NOT NULL,
        client_email    TEXT,
        description     TEXT NOT NULL,
        genre           TEXT,
        reference_links TEXT,
        amount          INTEGER NOT NULL DEFAULT 150000,
        deposit_amount  INTEGER NOT NULL DEFAULT 0,
        payment_method  TEXT,
        payment_ref     TEXT,
        flw_ref         TEXT,
        status          TEXT NOT NULL DEFAULT 'new',
        admin_notes     TEXT,
        created_at      TEXT NOT NULL DEFAULT (datetime('now')),
        paid_at         TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_download_token ON orders(download_token);
    CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
    CREATE INDEX IF NOT EXISTS idx_songs_active ON songs(is_active);
`);

export default db;
