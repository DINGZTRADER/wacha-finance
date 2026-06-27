import fs from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EPISODES_DIR = path.join(__dirname, "..", "..", "..", "movie", "episodes");
const MAX_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

// Track currently processing files to prevent concurrent FFmpeg runs on the same file
const processingFiles = new Set<string>();

export async function checkAndTrimVideos() {
    try {
        if (!fs.existsSync(EPISODES_DIR)) {
            console.log(`[Video Trimmer] Episodes directory does not exist yet at: ${EPISODES_DIR}`);
            return;
        }

        const files = await fs.promises.readdir(EPISODES_DIR);
        const videoFiles = files.filter(file => /\.(mp4|webm|mov|mkv)$/i.test(file));

        for (const file of videoFiles) {
            const filePath = path.join(EPISODES_DIR, file);
            
            // Skip if currently processing
            if (processingFiles.has(file)) {
                continue;
            }

            try {
                const stats = await fs.promises.stat(filePath);
                
                if (stats.size > MAX_SIZE_BYTES) {
                    console.log(`[Video Trimmer] Found video over 100MB: ${file} (${(stats.size / (1024 * 1024)).toFixed(2)} MB). Starting trim...`);
                    processingFiles.add(file);
                    
                    // Asynchronous background trim
                    trimVideo(filePath, file).catch(err => {
                        console.error(`[Video Trimmer] Error trimming ${file}:`, err.message);
                    }).finally(() => {
                        processingFiles.delete(file);
                    });
                }
            } catch (statErr: any) {
                console.error(`[Video Trimmer] Error checking stats for ${file}:`, statErr.message);
            }
        }
    } catch (err: any) {
        console.error("[Video Trimmer] Error scanning episodes directory:", err.message);
    }
}

async function trimVideo(filePath: string, filename: string) {
    const ext = path.extname(filename);
    const base = path.basename(filename, ext);
    const tempFilePath = path.join(EPISODES_DIR, `temp_trim_${Date.now()}${ext}`);

    try {
        // Fast trim to first 15 seconds
        // -y to overwrite if temp file exists
        // -ss 0 -t 15 to get first 15 seconds
        // -c copy to copy codecs directly without encoding (blazing fast, no CPU load)
        const cmd = `ffmpeg -y -ss 0 -t 15 -i "${filePath}" -c copy "${tempFilePath}"`;
        console.log(`[Video Trimmer] Executing: ${cmd}`);
        
        await execAsync(cmd);
        
        // Verify temp file exists and has size > 0
        if (fs.existsSync(tempFilePath)) {
            const tempStats = await fs.promises.stat(tempFilePath);
            if (tempStats.size > 0) {
                // Delete original, rename temp
                await fs.promises.unlink(filePath);
                await fs.promises.rename(tempFilePath, filePath);
                console.log(`[Video Trimmer] Successfully trimmed: ${filename} to under 100MB (${(tempStats.size / (1024 * 1024)).toFixed(2)} MB)`);
            } else {
                throw new Error("Temp file is empty");
            }
        } else {
            throw new Error("Temp file was not created");
        }
    } catch (err: any) {
        // Clean up temp file on failure
        if (fs.existsSync(tempFilePath)) {
            try {
                await fs.promises.unlink(tempFilePath);
            } catch (unlinkErr) {
                // ignore
            }
        }
        throw err;
    }
}
