#!/usr/bin/env bash
# Tạo icon app Android + iOS.
# Nguồn mặc định: assets/app-icon-source.png (1024×1024, vuông).
# Nếu không có PNG: fallback từ assets/splash-logo.svg + nền xanh (legacy).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE_PNG="$ROOT/assets/app-icon-source.png"
SVG_FALLBACK="$ROOT/assets/splash-logo.svg"
MASTER="$ROOT/assets/app-icon-1024.png"
MAGICK="$(command -v magick || true)"
CONVERT="$(command -v convert || true)"
if [[ -n "$MAGICK" ]]; then RUN=("$MAGICK"); elif [[ -n "$CONVERT" ]]; then RUN=("$CONVERT"); else
  echo "Cần cài ImageMagick (lệnh magick hoặc convert)." >&2
  exit 1
fi

build_master() {
  if [[ -f "$SOURCE_PNG" ]]; then
    "${RUN[@]}" "$SOURCE_PNG" -resize 1024x1024 "$MASTER"
  else
    "${RUN[@]}" -size 1024x1024 xc:'#1B5E20' \
      \( -background none -density 512 "$SVG_FALLBACK" -resize 940x940 \) \
      -gravity center -composite "$MASTER"
  fi
}

build_master

A="$ROOT/android/app/src/main/res"
"${RUN[@]}" "$MASTER" -resize 48x48   "$A/mipmap-mdpi/ic_launcher.png"
cp "$A/mipmap-mdpi/ic_launcher.png" "$A/mipmap-mdpi/ic_launcher_round.png"
"${RUN[@]}" "$MASTER" -resize 72x72   "$A/mipmap-hdpi/ic_launcher.png"
cp "$A/mipmap-hdpi/ic_launcher.png" "$A/mipmap-hdpi/ic_launcher_round.png"
"${RUN[@]}" "$MASTER" -resize 96x96  "$A/mipmap-xhdpi/ic_launcher.png"
cp "$A/mipmap-xhdpi/ic_launcher.png" "$A/mipmap-xhdpi/ic_launcher_round.png"
"${RUN[@]}" "$MASTER" -resize 144x144 "$A/mipmap-xxhdpi/ic_launcher.png"
cp "$A/mipmap-xxhdpi/ic_launcher.png" "$A/mipmap-xxhdpi/ic_launcher_round.png"
"${RUN[@]}" "$MASTER" -resize 192x192 "$A/mipmap-xxxhdpi/ic_launcher.png"
cp "$A/mipmap-xxxhdpi/ic_launcher.png" "$A/mipmap-xxxhdpi/ic_launcher_round.png"

I="$ROOT/ios/farming/Images.xcassets/AppIcon.appiconset"
"${RUN[@]}" "$MASTER" -resize 40x40   "$I/Icon-App-20x20@2x.png"
"${RUN[@]}" "$MASTER" -resize 60x60   "$I/Icon-App-20x20@3x.png"
"${RUN[@]}" "$MASTER" -resize 58x58   "$I/Icon-App-29x29@2x.png"
"${RUN[@]}" "$MASTER" -resize 87x87   "$I/Icon-App-29x29@3x.png"
"${RUN[@]}" "$MASTER" -resize 80x80   "$I/Icon-App-40x40@2x.png"
"${RUN[@]}" "$MASTER" -resize 120x120 "$I/Icon-App-40x40@3x.png"
cp "$I/Icon-App-40x40@3x.png" "$I/Icon-App-60x60@2x.png"
"${RUN[@]}" "$MASTER" -resize 180x180 "$I/Icon-App-60x60@3x.png"
"${RUN[@]}" "$MASTER" -resize 1024x1024 "$I/Icon-App-1024x1024.png"

echo "Đã cập nhật icon: $MASTER, Android mipmaps, iOS AppIcon.appiconset"
