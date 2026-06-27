import os
import shutil
import subprocess

movie_episodes_dir = r"e:\projects\wachaai\movie\episodes"
public_episodes_dir = r"e:\projects\wachaai\public\episodes"

print("Movie Episodes Directory:", movie_episodes_dir)
print("Public Episodes Directory:", public_episodes_dir)

def process_directory(episodes_dir):
    if not os.path.exists(episodes_dir):
        print(f"Directory {episodes_dir} does not exist. Creating...")
        os.makedirs(episodes_dir, exist_ok=True)
        return

    files = [f for f in os.listdir(episodes_dir) if f.endswith(".mp4")]

    for file in files:
        input_path = os.path.join(episodes_dir, file)
        size_mb = os.path.getsize(input_path) / (1024 * 1024)
        
        print(f"Processing: {file} in {os.path.basename(episodes_dir)} ({size_mb:.2f} MB)")
        
        if size_mb > 100:
            print("-> File is larger than 100MB. Compressing...")
            temp_path = os.path.join(episodes_dir, f"temp_{file}")
            
            try:
                # Compress using ffmpeg with libx264, crf 28, fast preset, and aac audio
                cmd = [
                    "ffmpeg", "-y", "-i", input_path,
                    "-vcodec", "libx264", "-crf", "28", "-preset", "fast",
                    "-acodec", "aac", "-b:a", "128k", temp_path
                ]
                print("Running command:", " ".join(cmd))
                subprocess.run(cmd, check=True)
                
                # Replace original with compressed version
                os.remove(input_path)
                os.rename(temp_path, input_path)
                
                new_size = os.path.getsize(input_path) / (1024 * 1024)
                print(f"Success! New size: {new_size:.2f} MB\n")
            except Exception as e:
                print(f"Error compressing {file}: {e}")
                if os.path.exists(temp_path):
                    os.remove(temp_path)
        else:
            print("-> File is already under 100MB. Skipping.\n")

# Process both directories
process_directory(movie_episodes_dir)
process_directory(public_episodes_dir)

# Sync files from movie to public
print("Syncing episodes from movie to public directory...")
if os.path.exists(movie_episodes_dir):
    movie_files = [f for f in os.listdir(movie_episodes_dir) if f.endswith(".mp4")]
    for file in movie_files:
        src_path = os.path.join(movie_episodes_dir, file)
        dest_path = os.path.join(public_episodes_dir, file)
        
        should_copy = False
        if not os.path.exists(dest_path):
            should_copy = True
        else:
            src_size = os.path.getsize(src_path)
            dest_size = os.path.getsize(dest_path)
            if src_size != dest_size:
                should_copy = True
                
        if should_copy:
            print(f"Copying {file} from movie to public...")
            shutil.copy2(src_path, dest_path)

print("Compression and sync job completed!")
