"""Turn docs album photos into web JPEGs under public/albums.

The docs folder stays off Git. Vercel serves the JPEGs as static files.
"""
from pathlib import Path

from PIL import Image, ImageOps
from pillow_heif import register_heif_opener

register_heif_opener()

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
OUT = ROOT / "public" / "albums"
SKIP = {("upscale urban", "IMG_8395.jpg")}
IMAGES = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"}


def main() -> None:
    if not DOCS.is_dir():
        raise SystemExit(f"missing {DOCS}")
    written = 0
    for folder in sorted(path for path in DOCS.iterdir() if path.is_dir()):
        dest_dir = OUT / folder.name
        dest_dir.mkdir(parents=True, exist_ok=True)
        for src in sorted(folder.iterdir()):
            if not src.is_file() or src.suffix.lower() not in IMAGES:
                continue
            if (folder.name, src.name) in SKIP:
                continue
            dest = dest_dir / f"{src.stem}.jpg"
            image = ImageOps.exif_transpose(Image.open(src))
            image.thumbnail((1600, 1600))
            image.convert("RGB").save(dest, "JPEG", quality=82, optimize=True)
            written += 1
            print(dest.relative_to(ROOT))
    print(f"{written} photos")


if __name__ == "__main__":
    main()
