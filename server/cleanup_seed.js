const Database = require('better-sqlite3');
const db = new Database('e:/projects/wachaai/server/data/music.db');
const res = db.prepare('DELETE FROM songs WHERE file_path = ?').run('placeholder.mp3');
console.log(`Deleted ${res.changes} broken seed songs.`);
db.close();
