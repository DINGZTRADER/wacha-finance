import "dotenv/config";
import pg from "pg";
import { v4 as uuid } from "uuid";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Ensure Node allows self-signed certs for local connection testing if needed
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const POSTGRES_URL = process.env.POSTGRES_URL;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_JWT_SECRET;
const SONGS_DIR = path.join(__dirname, "uploads", "songs");
const BUCKET_NAME = "wachaai-storage";

async function importLocalMP3s() {
    console.log("🚀 Starting Local MP3 Import via Supabase REST API...");

    if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
        throw new Error("❌ Missing Supabase URL or Secret Key in .env");
    }

    if (!POSTGRES_URL) {
        throw new Error("❌ Missing POSTGRES_URL in .env");
    }

    const pool = new Pool({
        connectionString: POSTGRES_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        // 1. Ensure bucket exists and is public
        console.log(`📦 Checking/Creating bucket: '${BUCKET_NAME}'`);
        const bucketUrl = `${SUPABASE_URL}/storage/v1/bucket`;
        
        let bucketRes = await fetch(bucketUrl, {
            headers: {
                'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
                'apikey': SUPABASE_SECRET_KEY
            }
        });
        const buckets = await bucketRes.json();
        
        const bucketExists = buckets && Array.isArray(buckets) && buckets.find(b => b.name === BUCKET_NAME);
        
        if (!bucketExists) {
            console.log(`  ➕ Bucket '${BUCKET_NAME}' not found. Creating as PUBLIC...`);
            const createRes = await fetch(bucketUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
                    'apikey': SUPABASE_SECRET_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: BUCKET_NAME,
                    name: BUCKET_NAME,
                    public: true,
                    file_size_limit: 52428800, // 50MB
                    allowed_mime_types: ["audio/mpeg", "audio/mp3", "audio/*", "image/*"]
                })
            });
            
            if (!createRes.ok) {
                const err = await createRes.text();
                console.error("Failed to create bucket:", err);
            }
        }

        // 2. Scan local files
        if (!fs.existsSync(SONGS_DIR)) {
            throw new Error(`Directory not found: ${SONGS_DIR}`);
        }
        
        const files = fs.readdirSync(SONGS_DIR).filter(f => f.toLowerCase().endsWith(".mp3") || f.toLowerCase().endsWith(".mpeg"));
        console.log(`🎵 Found ${files.length} audio files in local uploads/songs folder.\n`);

        let uploadedCount = 0;
        let skippedCount = 0;

        for (const file of files) {
            const filePath = path.join(SONGS_DIR, file);
            // Title logic: Remove extension
            const title = file.replace(/\.mp3$|\.mpeg$/i, "").trim();
            const storagePath = `songs/${encodeURIComponent(file)}`;

            // Check if it already exists in Postgres by title (to prevent duplicate entries if script runs twice)
            const checkTitle = await pool.query("SELECT id FROM songs WHERE title = $1 AND suno_embed IS NULL", [title]);
            if (checkTitle.rows.length > 0) {
                console.log(`  ⏭️ Skipped: '${title}' (Already in DB)`);
                skippedCount++;
                continue;
            }

            console.log(`  ⬆️ Uploading: '${file}'...`);
            const fileBuffer = fs.readFileSync(filePath);

            const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${storagePath}`;
            const uploadRes = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
                    'apikey': SUPABASE_SECRET_KEY,
                    'Content-Type': 'audio/mpeg',
                    'x-upsert': 'true'
                },
                body: fileBuffer
            });
            
            if (!uploadRes.ok) {
                const errText = await uploadRes.text();
                // If it exists and we used upsert, maybe it's fine. Wait, REST API uses POST for create, PUT/POST for upsert, but wait...
                // Sometimes POST fails if "duplicate". We can try PUT if POST fails.
                if (errText.includes("Duplicate") || uploadRes.status === 400 || uploadRes.status === 409) {
                    console.log(`    ⚠️ Conflict/Duplicate, retrying with PUT...`);
                    const putRes = await fetch(uploadUrl, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
                            'apikey': SUPABASE_SECRET_KEY,
                            'Content-Type': 'audio/mpeg',
                            'x-upsert': 'true'
                        },
                        body: fileBuffer
                    });
                    if (!putRes.ok) {
                         const putErrText = await putRes.text();
                         console.error(`  ❌ Failed to upload ${file}:`, putErrText);
                         continue;
                    }
                } else {
                    console.error(`  ❌ Failed to upload ${file}:`, errText);
                    continue;
                }
            }

            // Public URL format: {SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{path}
            const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${storagePath}`;
            
            // Insert into Postgres
            const id = uuid();
            const price = 3000;
            const artist = "Peter Wacha / Deejay Dings";
            const genre = file.toLowerCase().includes("amapiano") ? "Amapiano" : "Afrobeat";

            await pool.query(
                `INSERT INTO songs (id, title, artist, genre, price, file_path, is_active)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [id, title, artist, genre, price, publicUrl, 1]
            );

            console.log(`  ✅ Inserted DB Record: ${title}`);
            uploadedCount++;
        }

        console.log(`\n🎉 Import Complete! Uploaded: ${uploadedCount}, Skipped: ${skippedCount}`);

    } catch (err) {
        console.error("❌ Fatal Error:", err);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

importLocalMP3s();
