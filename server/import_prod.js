
import pg from "pg";
const { Pool } = pg;
import { v4 as uuid } from "uuid";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Using the provided non-pooling URL for more direct access during import
const POSTGRES_URL = "postgres://postgres.lvbblxadgxajnfdjipfr:GyA6CPBggeBh0j56@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require";
const HTML_PATH = path.join(__dirname, "uploads", "songs", "MyMusic.html");

async function runImport() {
    console.log("🚀 Starting Production Import to Supabase...");
    
    const pool = new Pool({
        connectionString: POSTGRES_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        // 1. Ensure Table Exists
        console.log("🛠️ Initializing schema if missing...");
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
        `);
        
        // Ensure suno_embed column exists (for older versions of the table)
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='songs' AND column_name='suno_embed') THEN
                    ALTER TABLE songs ADD COLUMN suno_embed TEXT;
                END IF;
            END $$;
        `);

        // 2. Parse HTML
        if (!fs.existsSync(HTML_PATH)) {
            throw new Error(`MyMusic.html not found at ${HTML_PATH}`);
        }
        const content = fs.readFileSync(HTML_PATH, "utf-8");
        const iframeRegex = /<iframe[^>]*src="([^"]*)"[^>]*>.*?<a[^>]*href="[^"]*\/song\/([^"]*)"[^>]*>Listen on (?:Suno|Dings)<\/a><\/iframe>/gs;
        
        let match;
        const embeds = [];
        const seenSunoIds = new Set();

        while ((match = iframeRegex.exec(content)) !== null) {
            const embedUrl = match[1];
            const sunoId = match[2];
            if (!seenSunoIds.has(sunoId)) {
                embeds.push({ embedUrl, sunoId });
                seenSunoIds.add(sunoId);
            }
        }

        console.log(`🎵 Found ${embeds.length} songs in MyMusic.html`);

        // 3. Insert Songs
        let importedCount = 0;
        let skippedCount = 0;

        for (const embed of embeds) {
            const id = uuid();
            const title = `AI Vision Track ${embed.sunoId.substring(0, 4)}`;
            
            // Deduplicate by embed URL
            const check = await pool.query("SELECT id FROM songs WHERE suno_embed = $1", [embed.embedUrl]);
            if (check.rows.length > 0) {
                skippedCount++;
                continue;
            }

            await pool.query(
                `INSERT INTO songs (id, title, artist, genre, price, suno_embed, is_active, file_path)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [id, title, "Peter Wacha", "AI Laboratory", 3000, embed.embedUrl, 1, ""]
            );
            importedCount++;
            console.log(`  ✅ Imported: ${title}`);
        }

        console.log(`\n🚀 Done! Imported: ${importedCount}, Skipped: ${skippedCount}`);
    } catch (err) {
        console.error("❌ Fatal Error:", err);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

runImport();
