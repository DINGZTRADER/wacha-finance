
import "dotenv/config";
import Database from "better-sqlite3";
import { v4 as uuid } from "uuid";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "data", "music.db");
const HTML_PATH = path.join(__dirname, "uploads", "songs", "MyMusic.html");

async function parseAndImport() {
    console.log("🚀 Starting import from MyMusic.html...");
    
    if (!fs.existsSync(HTML_PATH)) {
        console.error("❌ MyMusic.html not found at:", HTML_PATH);
        process.exit(1);
    }

    const db = new Database(DB_PATH);
    console.log("📂 Connected to SQLite database:", DB_PATH);

    // Ensure suno_embed column exists
    try {
        db.prepare("ALTER TABLE songs ADD COLUMN suno_embed TEXT").run();
        console.log("✅ Added suno_embed column.");
    } catch (e) {
        // already exists
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

    if (embeds.length === 0) {
        console.log("⚠️ No embeds found with standard regex, trying fallback...");
        const fallbackRegex = /<iframe[^>]*src="([^"]*)"/gs;
        let fm;
        while ((fm = fallbackRegex.exec(content)) !== null) {
            const url = fm[1];
            if (url.includes("suno.com/embed/")) {
                const parts = url.split("/");
                const sId = parts[parts.length - 1];
                if (!seenSunoIds.has(sId)) {
                    embeds.push({ embedUrl: url, sunoId: sId });
                    seenSunoIds.add(sId);
                }
            }
        }
    }

    console.log(`🎵 Found ${embeds.length} unique songs.\n`);

    const insert = db.prepare(`
        INSERT INTO songs (id, title, artist, genre, price, suno_embed, is_active, file_path)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const embed of embeds) {
        const id = uuid();
        const title = `AI Vision Track ${embed.sunoId.substring(0, 4)}`;
        
        try {
            insert.run(id, title, "Peter Wacha", "AI Laboratory", 3000, embed.embedUrl, 1, "");
            console.log(`  ✅ Imported: ${title}`);
        } catch (err) {
            console.error(`  ❌ Failed to import ${embed.sunoId}:`, err.message);
        }
    }

    console.log("\n🚀 Import complete! Closing DB.");
    db.close();
}

parseAndImport().catch(console.error);
