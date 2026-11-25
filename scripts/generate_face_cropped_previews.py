import os
import subprocess
import imageio_ffmpeg
import cv2

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
print("Using ffmpeg:", ffmpeg_exe)

input_dir = "DATA/VIDEOS/INPUTS"
output_dir = "public/videos"
os.makedirs(output_dir, exist_ok=True)
os.makedirs("public/crop_preview_check", exist_ok=True)

# Configuration for each subject:
# (start_sec, duration, crop_filter_expression)
# All crops produce clean 16:9 aspect ratio centered around face & eyes
crops_config = {
    # 0. Boy with yellow shirt: starts at 25.5s (prominent blink & head turn), crop tightly on face
    'blinking_0.mp4': {
        'start': 25.5,
        'dur': 7.0,
        'crop': 'crop=850:478:258:80'
    },
    # 1. Woman in blue shirt (user's favorite): starts at 0.5s, crop on face & eyes
    'blinking_1.mp4': {
        'start': 0.5,
        'dur': 8.0,
        'crop': 'crop=960:540:200:60'
    },
    # 2. Ginger man with freckles & blue eyes (3840x2160): starts at 0.5s, tight eye/face crop
    'blinking_2.mp4': {
        'start': 0.5,
        'dur': 7.0,
        'crop': 'crop=2560:1440:640:150'
    },
    # 3. Woman in white shirt (4096x2160): starts at 0.5s, crop on face & eyes
    'blinking_3.mp4': {
        'start': 0.5,
        'dur': 7.5,
        'crop': 'crop=2720:1530:688:100'
    },
    # 4. Man in suit (1280x720): starts at 0.5s, tight face crop (cuts off bottom suit)
    'blinking_4.mp4': {
        'start': 0.5,
        'dur': 7.5,
        'crop': 'crop=768:432:256:40'
    },
    # 5. Vertical video (2160x4096): starts at 3.5s, crop 16:9 on face & eyes!
    'blinking_5.mp4': {
        'start': 3.5,
        'dur': 7.0,
        'crop': 'crop=2160:1215:0:400'
    },
    # 6. Person looking at camera (3840x2160): starts at 3.5s (active blink)
    'blinking_6.mp4': {
        'start': 3.5,
        'dur': 6.0,
        'crop': 'crop=2560:1440:640:200'
    },
    # 7. Woman with black hair (2732x1440): starts at 0.5s (blinks multiple times)
    'blinking_7.mp4': {
        'start': 0.5,
        'dur': 4.8,
        'crop': 'crop=2048:1152:342:80'
    },
    # 8. Person looking forward (3840x2160): starts at 16.5s (active blink & head movement)
    'blinking_8.mp4': {
        'start': 16.5,
        'dur': 6.5,
        'crop': 'crop=2560:1440:640:250'
    },
    # 9. Boy with glasses & sweater (1280x720): starts at 2.5s (active blinks with glasses)
    'blinking_9.mp4': {
        'start': 2.5,
        'dur': 5.5,
        'crop': 'crop=800:450:240:50'
    },
    # 10. Subject in 4K (4096x2160): starts at 7.5s (active blink & tilt)
    'blinking_10.mp4': {
        'start': 7.5,
        'dur': 7.0,
        'crop': 'crop=2720:1530:688:150'
    },
    # 11. Woman in 4K (3840x2160): starts at 0.5s (active blinks)
    'blinking_11.mp4': {
        'start': 0.5,
        'dur': 7.5,
        'crop': 'crop=2560:1440:640:200'
    },
    # 12. Subject in 4K (3840x2160): starts at 0.5s (active blinks)
    'blinking_12.mp4': {
        'start': 0.5,
        'dur': 6.5,
        'crop': 'crop=2560:1440:640:300'
    },
}

for fname, cfg in crops_config.items():
    in_file = os.path.join(input_dir, fname)
    preview_fname = "preview_" + fname
    out_file = os.path.join(output_dir, preview_fname)
    temp_out = os.path.join(output_dir, "temp_" + preview_fname)
    
    start_sec = cfg['start']
    dur = cfg['dur']
    crop_expr = cfg['crop']
    
    # Scale final video to standard 640x360 for razor sharp thumbnail performance
    vf = f"{crop_expr},scale=640:360"
    
    print(f"Encoding {preview_fname}: ss={start_sec}s, t={dur}s, vf={vf}...")
    
    cmd = [
        ffmpeg_exe, "-y",
        "-ss", str(start_sec),
        "-i", in_file,
        "-t", str(dur),
        "-vf", vf,
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "22",
        "-g", "12",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        "-an",
        temp_out
    ]
    
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print(f"Error encoding {fname}:\n{res.stderr[-300:]}")
    else:
        if os.path.exists(out_file):
            os.remove(out_file)
        os.rename(temp_out, out_file)
        print(f"-> Successfully saved {out_file}")
        
        # Save sample frame to verify crop visually
        cap = cv2.VideoCapture(out_file)
        ret, frame = cap.read()
        if ret:
            check_path = os.path.join("public/crop_preview_check", os.path.splitext(preview_fname)[0] + ".jpg")
            cv2.imwrite(check_path, frame)
        cap.release()

print("\nAll 13 cropped active moving video previews generated successfully!")
