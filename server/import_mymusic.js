
import "dotenv/config";
import db from "./src/db.js";
import { v4 as uuid } from "uuid";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML_PATH = path.join(__dirname, "uploads", "songs", "MyMusic.html");

async function parseAndImport() {
    if (!fs.existsSync(HTML_PATH)) {
        console.error("❌ MyMusic.html not found at:", HTML_PATH);
        process.exit(1);
    }

    const content = fs.readFileSync(HTML_PATH, "utf-8");
    const iframeRegex = /<iframe[^>]*src="([^"]*)"[^>]*>.*?<a[^>]*href="[^"]*\/song\/([^"]*)"[^>]*>Listen on Suno<\/a><\/iframe>/gs;
    const fallbackRegex = /<iframe[^>]*src="([^"]*)"/gs;
    
    let match;
    const embeds = [];
    const seenSunoIds = new Set();

    // Try to get clean Suno IDs from the anchor tag first
    while ((match = iframeRegex.exec(content)) !== null) {
        const embedUrl = match[1];
        const sunoId = match[2];
        if (!seenSunoIds.has(sunoId)) {
            embeds.push({ embedUrl, sunoId });
            seenSunoIds.add(sunoId);
        }
    }

    // If we missed some (no anchor tag), just use the src
    if (embeds.length === 0) {
        let fallbackMatch;
        while ((fallbackMatch = fallbackRegex.exec(content)) !== null) {
            const embedUrl = fallbackMatch[1];
            if (embedUrl.includes("suno.com/embed/")) {
                const parts = embedUrl.split("/");
                const sunoId = parts[parts.length - 1];
                if (!seenSunoIds.has(sunoId)) {
                    embeds.push({ embedUrl, sunoId });
                    seenSunoIds.add(sunoId);
                }
            }
        }
    }

    console.log(`🎵 Found ${embeds.length} unique songs in MyMusic.html\n`);

    for (const embed of embeds) {
        const id = uuid();
        // Extract a "title" from the ID or just use "Suno Track"
        const title = `AI Vision Track ${embed.sunoId.substring(0, 4)}`;
        
        try {
            await db.run(
                `INSERT INTO songs (id, title, artist, genre, price, suno_embed, is_active)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    id,
                    title,
                    "Peter Wacha",
                    "AI Laboratory",
                    3000,
                    embed.embedUrl,
                    1
                ]
            );
            console.log(`  ✅ Imported: ${title}`);
        } catch (err) {
            console.error(`  ❌ Failed to import ${embed.sunoId}:`, err);
        }
    }

    console.log("\n🚀 Import complete! Songs are now live in the store.");
    process.exit(0);
}

parseAndImport().catch(console.error);
