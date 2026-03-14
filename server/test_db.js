import "dotenv/config";
import pg from "pg";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function test() {
    try {
        const res = await pool.query(`SELECT id, title, artist, genre, price, cover_art, duration, suno_embed, created_at, file_path
             FROM songs WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1`);
        console.log("Success:", res.rows);
    } catch (e) {
        console.error("Query Error:", e);
    } finally {
        await pool.end();
    }
}
test();
