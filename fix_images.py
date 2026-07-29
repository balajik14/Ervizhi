from PIL import Image
import os
import glob

base_dir = "mobile/assets/images"
png_files = glob.glob(os.path.join(base_dir, "*.png"))

for path in png_files:
    try:
        with Image.open(path) as im:
            # We enforce saving as a fresh RGBA PNG
            im = im.convert("RGBA")
            im.save(path, "PNG")
        print(f"Successfully re-encoded {os.path.basename(path)}")
    except Exception as e:
        print(f"Error processing {os.path.basename(path)}: {e}")
