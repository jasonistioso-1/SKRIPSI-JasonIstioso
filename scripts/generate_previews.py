import os
import subprocess
import imageio_ffmpeg

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
print("Using ffmpeg:", ffmpeg_exe)

input_dir = "DATA/VIDEOS/INPUTS"
output_dir = "public/videos"
os.makedirs(output_dir, exist_ok=True)

# Active animated ranges with prominent eye blinks and head motion for each subject
active_ranges = {
    'blinking_0.mp4': (25.0, 32.5),  # 7.5s - boy blinks, smiles, moves head!
    'blinking_1.mp4': (0.0, 10.0),   # 10.0s - woman in blue shirt blinks & moves (user's favorite!)
    'blinking_2.mp4': (0.0, 7.8),    # 7.8s - ginger man with freckles blinks!
    'blinking_3.mp4': (0.0, 8.0),    # 8.0s - woman in white blinks!
    'blinking_4.mp4': (0.0, 8.0),    # 8.0s - man in suit blinks!
    'blinking_5.mp4': (3.0, 10.0),   # 7.0s - subject blinks!
    'blinking_6.mp4': (3.0, 9.6),    # 6.6s - subject blinks!
    'blinking_7.mp4': (0.0, 5.4),    # 5.4s - woman blinks!
    'blinking_8.mp4': (16.0, 23.0),  # 7.0s - subject blinks!
    'blinking_9.mp4': (2.0, 8.1),    # 6.1s - boy with glasses blinks!
    'blinking_10.mp4': (7.0, 14.0),  # 7.0s - subject blinks!
    'blinking_11.mp4': (0.0, 8.0),   # 8.0s - woman blinks!
    'blinking_12.mp4': (0.0, 7.2),   # 7.2s - subject blinks!
}

for fname, (start_sec, end_sec) in active_ranges.items():
    in_file = os.path.join(input_dir, fname)
    dur = end_sec - start_sec
    preview_fname = "preview_" + fname
    out_file = os.path.join(output_dir, preview_fname)
    temp_out = os.path.join(output_dir, "temp_" + preview_fname)
    
    print(f"Creating preview {preview_fname} from {fname} ({start_sec}s - {end_sec}s)...")
    cmd = [
        ffmpeg_exe, "-y",
        "-ss", str(start_sec),
        "-i", in_file,
        "-t", str(dur),
        "-vf", "scale=w=640:h=360:force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-g", "12",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        "-an",
        temp_out
    ]
    
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print(f"Error for {fname}:\n{res.stderr[-400:]}")
    else:
        if os.path.exists(out_file):
            os.remove(out_file)
        os.rename(temp_out, out_file)
        print(f"Successfully created {out_file} ({dur:.1f}s)")

print("All dynamic preview clips created successfully!")
