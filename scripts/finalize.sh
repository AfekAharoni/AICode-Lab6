#!/usr/bin/env bash
# Compress a finished render for upload, without overwriting anything.
# Usage: scripts/finalize.sh out/render-01.mp4   →  out/final-01.mp4
# - H.264 CRF 23 (visually clean, small file), yuv420p for any player
# - narration loudness-normalized to -16 LUFS so every scene is equally loud
# - +faststart so it starts playing immediately when streamed
set -euo pipefail
in="$1"
n="$(basename "$in" .mp4 | sed 's/render-//')"
out="out/final-$n.mp4"
if [ -e "$out" ]; then echo "$out already exists, not overwriting" >&2; exit 1; fi
ffmpeg -hide_banner -loglevel error -i "$in" \
  -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p \
  -af loudnorm=I=-16:TP=-1.5:LRA=11 -c:a aac -b:a 128k \
  -movflags +faststart "$out"
ls -lh "$in" "$out" | awk '{print $5, $9}'
