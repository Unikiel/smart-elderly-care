"""Write a web-sized JPEG for one album photo, including HEIC."""

import sys
from pathlib import Path

from PIL import Image, ImageOps
from pillow_heif import register_heif_opener

register_heif_opener()


def main() -> None:
    src = Path(sys.argv[1])
    dest = Path(sys.argv[2])
    image = ImageOps.exif_transpose(Image.open(src))
    image.thumbnail((1600, 1600))
    dest.parent.mkdir(parents=True, exist_ok=True)
    image.convert("RGB").save(dest, "JPEG", quality=82, optimize=True)


if __name__ == "__main__":
    main()
