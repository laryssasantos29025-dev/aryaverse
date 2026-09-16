"use client";

import Image from "next/image";
import { useState } from "react";

type OfficialLogoProps = { className?: string; priority?: boolean; preferTransparent?: boolean };

/** Official artwork supplied by AryaVerse. It is intentionally rendered unchanged. */
export function OfficialLogo({ className = "", priority = false, preferTransparent = true }: OfficialLogoProps) {
  const transparentPath = "/brand/aryaverse-official-logo-transparent.png";
  const fallbackPath = "/brand/aryaverse-official-logo.png";
  const [source, setSource] = useState(preferTransparent ? transparentPath : fallbackPath);

  return <Image
    src={source}
    alt="AryaVerse"
    width={1536}
    height={1024}
    priority={priority}
    className={className}
    onError={() => {
      if (source !== fallbackPath) setSource(fallbackPath);
    }}
    style={{
      opacity: 1,
      filter: "none",
      mixBlendMode: "normal",
      background: "transparent",
    }}
  />;
}
