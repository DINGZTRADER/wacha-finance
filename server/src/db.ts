import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

// Use Vercel Postgres connection string if available, otherwise fallback to local/other
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString && process.env.NODE_ENV === "production") {
    throw new Error("POSTGRES_URL or DATABASE_URL is required in production");
}

const pool = new Pool({
    connectionString: connectionString || "postgresql://postgres:postgres@localhost:5432/wachaai",
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Helper to mimic better-sqlite3 sync-like API or just provide a clean async interface
// Since we are migrating a full Express app, we'll use a wrapper that helps with the transition
export const db = {
    async query(text: string, params?: any[]) {
        return pool.query(text, params);
    },
    async get(text: string, params?: any[]) {
        const { rows } = await pool.query(text, params);
        return rows[0];
    },
    async all(text: string, params?: any[]) {
        const { rows } = await pool.query(text, params);
        return rows;
    },
    async run(text: string, params?: any[]) {
        return pool.query(text, params);
    }
};

/**
 * Initialize Postgres Schema
 */
export async function initDB() {
    await pool.query(`
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
    `);
    console.log("🐘 Postgres database initialized.");
}

export default db;
