import Database from 'better-sqlite3';

const dbFiles = ['music.db', 'wachaai.db'];

for (const f of dbFiles) {
    try {
        const db = new Database(`./server/data/${f}`);
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        console.log(`\nFile: ${f}`);
        console.log(`Tables: ${tables.map(t => t.name).join(', ')}`);
        
        if (tables.some(t => t.name === 'songs')) {
            const count = db.prepare("SELECT COUNT(*) as count FROM songs").get();
            console.log(`Songs count: ${count.count}`);
            const sample = db.prepare("SELECT title, file_path FROM songs LIMIT 1").get();
            console.log(`Sample: ${JSON.stringify(sample)}`);
        }
    } catch (e) {
        console.log(`Error reading ${f}: ${e.message}`);
    }
}
