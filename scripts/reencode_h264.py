import os
import subprocess
import glob
import imageio_ffmpeg

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
print("Using ffmpeg:", ffmpeg_exe)

input_dir = "DATA/VIDEOS/INPUTS"
output_dir = "public/videos"
os.makedirs(output_dir, exist_ok=True)

input_files = sorted(glob.glob(os.path.join(input_dir, "*.mp4")))

for in_file in input_files:
    fname = os.path.basename(in_file)
    out_file = os.path.join(output_dir, fname)
    temp_out = os.path.join(output_dir, "temp_" + fname)
    
    print(f"Converting {fname}...")
    cmd = [
        ffmpeg_exe, "-y",
        "-i", in_file,
        "-vf", "scale=w=1280:h=720:force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "22",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        "-an",
        temp_out
    ]
    
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print(f"Error encoding {fname}:\n{res.stderr[-500:]}")
    else:
        if os.path.exists(out_file):
            os.remove(out_file)
        os.rename(temp_out, out_file)
        print(f"Successfully encoded {fname}")

print("All videos encoded successfully!")
