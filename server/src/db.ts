import "dotenv/config";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import pg from "pg";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Use Vercel Postgres connection string if available
export const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
export const isPostgres = !!connectionString;

let pool: any = null;
let sqlite: any = null;

function ensureConfiguredDatabase() {
    if (process.env.VERCEL && !isPostgres) {
        throw new Error("Database is not configured for Vercel. Set POSTGRES_URL or DATABASE_URL.");
    }
}

async function getSqlite() {
    if (sqlite) return sqlite;
    if (process.env.VERCEL) {
        throw new Error("SQLite is not supported on Vercel. Please configure POSTGRES_URL.");
    }
    // Dynamic import hidden from Vercel NFT tracer to avoid build/runtime errors
    const dbModuleName = "better-sqlite3";
    const { default: Database } = await import(dbModuleName);
    const DB_PATH = path.join(__dirname, "..", "data", "music.db");
    sqlite = new Database(DB_PATH);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    return sqlite;
}

if (isPostgres) {
    pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
    });
}

// Helper to convert $1, $2 to ? for SQLite
function translateSQL(sql: string): string {
    return isPostgres ? sql : sql.replace(/\$(\d+)/g, "?");
}

export const db = {
    async query(text: string, params?: any[]) {
        if (isPostgres) return pool.query(text, params);
        const rows = await this.all(text, params);
        return { rows };
    },
    async get(text: string, params?: any[]) {
        if (isPostgres) {
            const { rows } = await pool.query(text, params);
            return rows[0];
        }
        ensureConfiguredDatabase();
        const s = await getSqlite();
        return s.prepare(translateSQL(text)).get(...(params || []));
    },
    async all(text: string, params?: any[]) {
        if (isPostgres) {
            const { rows } = await pool.query(text, params);
            return rows;
        }
        ensureConfiguredDatabase();
        const s = await getSqlite();
        return s.prepare(translateSQL(text)).all(...(params || []));
    },
    async run(text: string, params?: any[]) {
        if (isPostgres) return pool.query(text, params);
        ensureConfiguredDatabase();
        const s = await getSqlite();
        return s.prepare(translateSQL(text)).run(...(params || []));
    }
};

export async function initDB() {
    if (isPostgres) {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS songs (
                id          TEXT PRIMARY KEY,
                title       TEXT NOT NULL,
                artist      TEXT NOT NULL DEFAULT 'Peter Wacha',
                genre       TEXT NOT NULL DEFAULT 'Afrobeat',
                price       INTEGER NOT NULL DEFAULT 3000,
                cover_art   TEXT,
                file_path   TEXT,
                preview_path TEXT,
                duration    INTEGER DEFAULT 0,
                suno_embed  TEXT,
                created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                is_active   INTEGER NOT NULL DEFAULT 1
            );

            CREATE TABLE IF NOT EXISTS orders (
                id              TEXT PRIMARY KEY,
                song_id         TEXT NOT NULL REFERENCES songs(id),
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
                created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                paid_at         TIMESTAMP WITH TIME ZONE
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
                created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                paid_at         TIMESTAMP WITH TIME ZONE
            );

            CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
            CREATE INDEX IF NOT EXISTS idx_orders_download_token ON orders(download_token);
            CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
            CREATE INDEX IF NOT EXISTS idx_songs_active ON songs(is_active);

            -- Ensure suno_embed column exists
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='songs' AND column_name='suno_embed') THEN
                    ALTER TABLE songs ADD COLUMN suno_embed TEXT;
                END IF;
            END $$;
        `);
        console.log("🐘 Postgres database initialized.");
    } else {
        if (process.env.VERCEL) {
            console.warn("⚠️ POSTGRES_URL not found. Skipping SQLite init on Vercel.");
            return;
        }
        const s = await getSqlite();
        s.exec(`
            CREATE TABLE IF NOT EXISTS songs (
                id          TEXT PRIMARY KEY,
                title       TEXT NOT NULL,
                artist      TEXT NOT NULL DEFAULT 'Peter Wacha',
                genre       TEXT NOT NULL DEFAULT 'Afrobeat',
                price       INTEGER NOT NULL DEFAULT 3000,
                cover_art   TEXT,
                file_path   TEXT,
                preview_path TEXT,
                duration    INTEGER DEFAULT 0,
                suno_embed  TEXT,
                created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                is_active   INTEGER NOT NULL DEFAULT 1
            );

            CREATE TABLE IF NOT EXISTS orders (
                id              TEXT PRIMARY KEY,
                song_id         TEXT NOT NULL REFERENCES songs(id),
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
                created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                paid_at         TIMESTAMP WITH TIME ZONE
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
                created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                paid_at         TIMESTAMP WITH TIME ZONE
            );
        `);
        // Check if column exists in SQLite
        const info = s.prepare("PRAGMA table_info(songs)").all();
        if (!info.some((c: any) => c.name === "suno_embed")) {
            s.exec("ALTER TABLE songs ADD COLUMN suno_embed TEXT");
        }
        console.log("📁 SQLite database ready.");
    }
}

export default db;
