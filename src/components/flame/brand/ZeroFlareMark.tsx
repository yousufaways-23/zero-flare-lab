// FLAME EVIDENCE LAB emblem — the original ZERO FLARE team mark, recovered
// from the project TAR (public/brand/zero-flare-emblem.png, 515×515 RGBA).
// R010 resolved: the official brand asset was restored from the workspace
// archive on 2026-11-12; the previous inline vector was a placeholder.
export function ZeroFlareMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
     
    <img
      src="/brand/zero-flare-emblem.png"
      width={size}
      height={size}
      alt="ZERO FLARE mission mark"
      className={className}
      loading="eager"
      decoding="async"
    />
  );
}
