"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/**
 * Player de VSL desacoplado do provedor (YouTube unlisted, Vimeo, ou
 * Mux/Cloudflare Stream). Troque `EMBED_URL` sem tocar no resto da página.
 * Autoplay mudo com legenda quando o provedor suportar via query params.
 */
const EMBED_URL = process.env.NEXT_PUBLIC_VSL_EMBED_URL ?? "";
const THUMBNAIL_URL = process.env.NEXT_PUBLIC_VSL_THUMBNAIL_URL ?? "";

export default function VSLPlayer() {
  const [tocando, setTocando] = useState(false);

  if (!EMBED_URL) {
    return (
      <div className="aspect-video w-full rounded-lg bg-carvao-800 border border-carvao-700 flex items-center justify-center">
        <p className="text-trigo-400 text-sm px-6 text-center">
          Espaço reservado do VSL — configure NEXT_PUBLIC_VSL_EMBED_URL e
          NEXT_PUBLIC_VSL_THUMBNAIL_URL no .env
        </p>
      </div>
    );
  }

  if (!tocando) {
    return (
      <button
        onClick={() => setTocando(true)}
        className="relative aspect-video w-full rounded-lg overflow-hidden group"
        aria-label="Assistir ao vídeo"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={THUMBNAIL_URL} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-carvao-950/30 group-hover:bg-carvao-950/40 transition-colors flex items-center justify-center">
          <span className="h-16 w-16 rounded-full bg-brasa-500 flex items-center justify-center">
            <Play className="h-7 w-7 text-carvao-950 ml-1" fill="currentColor" />
          </span>
        </div>
      </button>
    );
  }

  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden">
      <iframe
        src={EMBED_URL}
        className="h-full w-full"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
