import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve('server/data/music.db');
if (!fs.existsSync(dbPath)) {
    console.error('DB not found at', dbPath);
    process.exit(1);
}

const db = new Database(dbPath);

try {
    const songs = db.prepare("SELECT * FROM songs").all();
    console.log(JSON.stringify(songs));
    process.exit(0);
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
