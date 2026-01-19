import os
from PIL import Image

# List of the specific files that failed in your logs
files_to_fix = [
    "assets/images/activities/batorama.png",
    "assets/images/restaurants/tire-bouchon.png",
    "assets/images/museums/rohan_palace.png"
]

def fix_image(file_path):
    # Check if file exists to avoid crashing
    if not os.path.exists(file_path):
        print(f"⚠️  File not found: {file_path}")
        return

    try:
        # Open the image. Pillow auto-detects the REAL format (JPG, PNG, etc.)
        with Image.open(file_path) as img:
            print(f"Processing {file_path}...")
            print(f"   Detected actual format: {img.format}")

            # Convert to RGBA (ensures it has an alpha channel if needed, standardizes it)
            img = img.convert("RGBA")

            # Overwrite the file, forcing it to be a valid PNG
            img.save(file_path, "PNG")
            print(f"✅ Fixed and saved as valid PNG: {file_path}")

    except Exception as e:
        print(f"❌ Failed to fix {file_path}: {e}")

if __name__ == "__main__":
    print("Starting image fix...")
    for path in files_to_fix:
        fix_image(path)
    print("Done.")
