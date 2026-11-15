"use client";

// ZERO FLARE — VideoShelf (Phase 5 W6): verified research videos mapped to
// investigations and the 3D Lab. Sources: the curated videos.json shelf PLUS
// the live-verified media registry (src/data/generated/media-registry.json),
// which contributes corpus-linked videos (e.g. the CFI-G NASA video embedded
// in the ACME research document) with hardware attribution. Performance +
// privacy: thumbnails render first (facade); the iframe mounts only on user
// click; if the embed fails, the card falls back to a plain link card.
// Source types are labelled honestly — NASA-official vs institutional vs
// educator vs corpus-linked mission video.

import { useMemo, useState } from "react";
import videosDoc from "@/data/generated/videos.json";
import registryDoc from "@/data/generated/media-registry.json";
import { PlayCircle, ExternalLink, Link2Off } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VideoRecord {
  id: string;
  title: string;
  channel: string;
  sourceType: string;
  overview: string;
  mapsTo: string[];
  placement: string[];
  hardware?: string[];
  origin?: string;
  durationNote?: string | null;
}

interface RegistryEntry {
  id: string;
  kind: string;
  url: string;
  title: string | null;
  author: string | null;
  sourceType: string;
  origin: string;
  mapsTo: string[];
  hardware?: string[];
  placement: string[];
  overview: string;
  durationNote?: string | null;
  status: string;
  verify?: { title?: string | null; author?: string | null } | null;
}

const SOURCE_LABEL: Record<string, string> = {
  "independent-science-communicator": "independent educator (not NASA)",
  "scientific-society": "scientific society",
  "university-seminar": "university seminar",
  "research-institution": "research institution",
  "university-course": "university course",
  "un-agency": "UN agency",
  "nasa-official": "NASA official",
  "nasa-mission-video": "NASA mission video (corpus-linked)",
};

export function VideoShelf({ context, accession }: { context: "investigation" | "lab3d" | "mission"; accession?: string }) {
  const videos = useMemo(() => {
    const curated = (videosDoc as { videos: VideoRecord[] }).videos;
    const reg = (registryDoc as { entries: RegistryEntry[] }).entries ?? [];
    // corpus-linked YouTube entries from the registry that are not already curated
    const corpusYt: VideoRecord[] = reg
      .filter((e) => e.kind === "youtube" && e.origin === "corpus-metadata" && e.status === "verified")
      .map((e) => ({
        id: e.id.replace(/^yt-/, ""),
        title: e.verify?.title ?? e.title ?? "Corpus-linked mission video",
        channel: e.verify?.author ?? e.author ?? "NASA (via corpus metadata)",
        sourceType: "nasa-mission-video",
        overview: e.overview,
        mapsTo: e.mapsTo,
        placement: e.placement,
        hardware: e.hardware,
        origin: e.origin,
      }));
    const all = [...curated, ...corpusYt];
    return all.filter((v) =>
      v.placement.includes(context) && (!accession || v.mapsTo.includes(accession)),
    );
  }, [context, accession]);

  if (videos.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <PlayCircle className="h-4 w-4 text-primary" aria-hidden />
          Research videos
        </h3>
        <p className="text-[11px] text-muted-foreground">
          Live-verified sources — topical context, not NASA experimental footage unless labelled
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
    </div>
  );
}

function VideoCard({ video }: { video: VideoRecord }) {
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <figure className="glass-panel rounded-xl p-4">
        <div className="flex items-start gap-2">
          <Link2Off className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden />
          <div className="min-w-0">
            <a
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold hover:underline"
            >
              {video.title}
            </a>
            <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
              The embedded player could not load in this browser — open the video directly on{" "}
              <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                YouTube
              </a>
              . Source: {video.channel} · {SOURCE_LABEL[video.sourceType] ?? video.sourceType}.
            </p>
          </div>
        </div>
      </figure>
    );
  }

  return (
    <figure className="glass-panel overflow-hidden rounded-xl">
      <div className="relative aspect-video w-full bg-[#04091c]">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onError={() => setFailed(true)}
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 h-full w-full"
            aria-label={`Play video: ${video.title} (loads the YouTube player)`}
          >
            <img
              src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
              alt={`Video thumbnail: ${video.title}`}
              loading="lazy"
              onError={() => setFailed(true)}
              className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
            />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid h-12 w-12 place-items-center rounded-full border border-[#97e2fe]/60 bg-[#030b26]/80 backdrop-blur-sm transition-transform group-hover:scale-110">
                <PlayCircle className="h-7 w-7 text-[#97e2fe]" aria-hidden />
              </span>
            </span>
          </button>
        )}
      </div>
      <figcaption className="space-y-1.5 p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <a
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 truncate text-xs font-semibold hover:underline"
            title={video.title}
          >
            {video.title}
          </a>
          <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden />
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
          {video.channel} ·{" "}
          <Badge variant="outline" className="px-1 py-0 text-[9px]">{SOURCE_LABEL[video.sourceType] ?? video.sourceType}</Badge>
          {(video.hardware ?? []).map((h) => (
            <Badge key={h} variant="outline" className="border-[#5799d1]/40 px-1 py-0 text-[9px] text-[#9ccae9]">
              {h}
            </Badge>
          ))}
          {video.origin === "corpus-metadata" ? (
            <Badge variant="outline" className="border-amber-500/40 px-1 py-0 text-[9px] text-amber-300">
              corpus-linked
            </Badge>
          ) : null}
        </div>
        <p className="text-[11px] leading-snug text-muted-foreground">{video.overview}</p>
      </figcaption>
    </figure>
  );
}
