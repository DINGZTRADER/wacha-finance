import pg from "pg";
const { Client } = pg;

const connectionString = "postgres://postgres.lvbblxadgxajnfdjipfr:GyA6CPBggeBh0j56@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require";

async function check() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();
        const res = await client.query("SELECT COUNT(*) FROM songs");
        console.log("Total songs in Postgres:", res.rows[0].count);
        
        const genres = await client.query("SELECT DISTINCT genre FROM songs");
        console.log("Genres found:", genres.rows.map(r => r.genre));
        
        const sample = await client.query("SELECT title, genre FROM songs LIMIT 5");
        console.log("Sample songs:", sample.rows);
    } catch (err) {
        console.error("Connection error:", err.message);
    } finally {
        await client.end();
    }
}

check();
