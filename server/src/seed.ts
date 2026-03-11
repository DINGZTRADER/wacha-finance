/**
 * Seed script — creates sample songs for testing.
 * Run with: npm run seed
 */
import "dotenv/config";
import db from "./db.js";
import { v4 as uuid } from "uuid";

const songs = [
    {
        title: "Kampala Sunrise",
        artist: "Peter Wacha",
        genre: "Afrobeat",
        price: 3000,
    },
    {
        title: "Digital Warrior",
        artist: "Peter Wacha",
        genre: "Hip-Hop",
        price: 3000,
    },
    {
        title: "Lake Victoria Vibes",
        artist: "Peter Wacha",
        genre: "Dancehall",
        price: 3000,
    },
];

console.log("🌱 Seeding database with sample songs...\n");

for (const song of songs) {
    const id = uuid();
    db.prepare(
        `INSERT OR IGNORE INTO songs (id, title, artist, genre, price, file_path)
         VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, song.title, song.artist, song.genre, song.price, "placeholder.mp3");
    console.log(`  ✅ ${song.title} (${song.genre}) — UGX ${song.price.toLocaleString()}`);
}

console.log("\n🎵 Seed complete! Upload real audio files via the admin dashboard.\n");
