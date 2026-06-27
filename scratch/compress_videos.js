import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const movieEpisodesDir = path.join(__dirname, "..", "movie", "episodes");
const publicEpisodesDir = path.join(__dirname, "..", "public", "episodes");

console.log("Movie Episodes Directory:", movieEpisodesDir);
console.log("Public Episodes Directory:", publicEpisodesDir);

function processDirectory(episodesDir) {
    if (!fs.existsSync(episodesDir)) {
        console.log(`Directory ${episodesDir} does not exist. Creating...`);
        fs.mkdirSync(episodesDir, { recursive: true });
    }

    const files = fs.readdirSync(episodesDir).filter(file => file.endsWith(".mp4"));

    for (const file of files) {
        const inputPath = path.join(episodesDir, file);
        const stat = fs.statSync(inputPath);
        const sizeMB = stat.size / (1024 * 1024);
        
        console.log(`Processing: ${file} in ${path.basename(episodesDir)} (${sizeMB.toFixed(2)} MB)`);
        
        if (sizeMB > 100) {
            console.log(`-> File is larger than 100MB. Compressing...`);
            const tempPath = path.join(episodesDir, `temp_${file}`);
            
            try {
                // Compress using libx264 and crf 28 for web-optimized size
                const cmd = `ffmpeg -y -i "${inputPath}" -vcodec libx264 -crf 28 -preset fast -acodec aac -b:a 128k "${tempPath}"`;
                console.log(`Running: ${cmd}`);
                execSync(cmd, { stdio: "inherit" });
                
                // Replace original with compressed version
                fs.unlinkSync(inputPath);
                fs.renameSync(tempPath, inputPath);
                
                const newStat = fs.statSync(inputPath);
                console.log(`Success! New size: ${(newStat.size / (1024 * 1024)).toFixed(2)} MB\n`);
            } catch (err) {
                console.error(`Error compressing ${file}:`, err);
                if (fs.existsSync(tempPath)) {
                    fs.unlinkSync(tempPath);
                }
            }
        } else {
            console.log("-> File is already under 100MB. Skipping.\n");
        }
    }
}

// Process both directories
processDirectory(movieEpisodesDir);
processDirectory(publicEpisodesDir);

// Sync files from movieEpisodesDir to publicEpisodesDir to ensure consistency
console.log("Syncing episodes from movie to public directory...");
if (fs.existsSync(movieEpisodesDir)) {
    const movieFiles = fs.readdirSync(movieEpisodesDir).filter(file => file.endsWith(".mp4"));
    for (const file of movieFiles) {
        const srcPath = path.join(movieEpisodesDir, file);
        const destPath = path.join(publicEpisodesDir, file);
        
        let shouldCopy = false;
        if (!fs.existsSync(destPath)) {
            shouldCopy = true;
        } else {
            const srcStat = fs.statSync(srcPath);
            const destStat = fs.statSync(destPath);
            if (srcStat.size !== destStat.size) {
                shouldCopy = true;
            }
        }
        
        if (shouldCopy) {
            console.log(`Copying ${file} from movie to public...`);
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

console.log("Compression and sync job completed!");
