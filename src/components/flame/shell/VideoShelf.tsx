"use client";

// ZERO FLARE — VideoShelf: verified educational/research videos mapped to
// investigations and the 3D Lab. Performance + privacy: thumbnails render
// first (facade); the iframe mounts only on user click. Every entry is
// oEmbed-verified with title/channel/scientific overview, and the source
// type is labelled honestly (NASA-official vs institutional vs educator).

import { useMemo, useState } from "react";
import videosDoc from "@/data/generated/videos.json";
import { PlayCircle, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VideoRecord {
  id: string;
  title: string;
  channel: string;
  sourceType: string;
  overview: string;
  mapsTo: string[];
  placement: string[];
}

const SOURCE_LABEL: Record<string, string> = {
  "independent-science-communicator": "independent educator (not NASA)",
  "scientific-society": "scientific society",
  "university-seminar": "university seminar",
  "research-institution": "research institution",
  "university-course": "university course",
  "un-agency": "UN agency",
  "nasa-official": "NASA official",
};

export function VideoShelf({ context, accession }: { context: "investigation" | "lab3d" | "mission"; accession?: string }) {
  const videos = useMemo(() => {
    const all = (videosDoc as { videos: VideoRecord[] }).videos;
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
          Curated research videos
        </h3>
        <p className="text-[11px] text-muted-foreground">
          oEmbed-verified educational sources — topical context, not NASA experimental footage unless labelled
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
  return (
    <figure className="glass-panel overflow-hidden rounded-xl">
      <div className="relative aspect-video w-full bg-[#04091c]">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
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
        <div className="text-[10px] text-muted-foreground">
          {video.channel} · <Badge variant="outline" className="px-1 py-0 text-[9px]">{SOURCE_LABEL[video.sourceType] ?? video.sourceType}</Badge>
        </div>
        <p className="text-[11px] leading-snug text-muted-foreground">{video.overview}</p>
      </figcaption>
    </figure>
  );
}
