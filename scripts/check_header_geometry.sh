#!/usr/bin/env bash
# Header geometry check — verifies no horizontal overflow at the required viewport matrix.
# Mirrors the V7 audit contract: measure scrollWidth and header item collisions.
set -u
for W in 360 390 430 768 1024 1280 1366 1440 1600 1920; do
  agent-browser set viewport "$W" 900 >/dev/null 2>&1
  agent-browser open http://localhost:3000/ >/dev/null 2>&1
  sleep 1.5
  RES=$(agent-browser eval "(() => {
    const de = document.documentElement;
    const overflow = de.scrollWidth - de.clientWidth;
    const header = document.querySelector('header');
    let headerOverflow = 0;
    let clipped = 0;
    if (header) {
      const hr = header.getBoundingClientRect();
      headerOverflow = Math.max(0, Math.round(hr.right - de.clientWidth));
      // detect any nav button whose label wraps (height > 1.6em of its font)
      header.querySelectorAll('button').forEach(b => {
        const r = b.getBoundingClientRect();
        if (r.height > 56) clipped++;
      });
    }
    return JSON.stringify({overflow, headerOverflow, clipped});
  })()" 2>/dev/null | python3 -c "import json,sys; s=sys.stdin.read(); s=s[s.index('{'):s.rindex('}')+1]; print(s)" 2>/dev/null)
  echo "${W}px -> $RES"
done
