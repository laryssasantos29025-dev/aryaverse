"use client";

import Image from "next/image";
import type { AryaState } from "./arya-state";

export const poseByState: Record<AryaState, string> = {
  idle: "/arya/arya-idle.png",
  welcome: "/arya/arya-welcome.png",
  reading: "/arya/arya-idle.png",
  thinking: "/arya/arya-thinking.png",
  explaining: "/arya/arya-explaining.png",
  celebrating: "/arya/arya-celebrating.png",
  studying: "/arya/arya-studying.png",
  resting: "/arya/arya-resting.png",
  affection: "/arya/arya-affection.png",
};

export type AryaCharacterSize = "small" | "medium" | "large";

export function AryaCharacter({ state, size = "medium" }: { state: AryaState; size?: AryaCharacterSize }) {
  return <span className={`arya-character arya-character-${size} arya-character-${state}`} aria-hidden="true"><Image key={state} src={poseByState[state]} alt="" fill sizes="(max-width: 640px) 82px, (max-width: 1024px) 116px, 150px" priority={state === "idle" || state === "welcome"} className="object-contain object-bottom" /></span>;
}

/** `reading` reutiliza temporariamente a pose idle; ainda não há uma arte exclusiva para leitura. */
