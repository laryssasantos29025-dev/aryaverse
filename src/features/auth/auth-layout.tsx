"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { OfficialLogo } from "@/components/brand/official-logo";
import "./auth-layout.css";

const butterflies = ["first", "second", "third", "fourth", "fifth"] as const;

export function AuthLayout({ children }: { children: ReactNode }) {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const sceneStyle = { "--scene-x": `${pointer.x}px`, "--scene-y": `${pointer.y}px` } as CSSProperties;
  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = event.currentTarget.getBoundingClientRect();
    setPointer({ x: ((event.clientX - box.left) / box.width - 0.5) * 8, y: ((event.clientY - box.top) / box.height - 0.5) * 8 });
  };

  return <main className="auth-gateway" onPointerMove={handlePointerMove} onPointerLeave={() => setPointer({ x: 0, y: 0 })} style={sceneStyle}>
    <section className="auth-scene" aria-label="Universo visual AryaVerse">
      <div className="auth-deep-water" /><div className="auth-waterfall" /><div className="auth-mist" /><div className="auth-light-shaft" /><div className="auth-reflection" />
      <div className="auth-logo-stage"><div className="auth-logo-glow" /><OfficialLogo priority preferTransparent className="auth-official-logo" /><span className="auth-ripple-one" /><span className="auth-ripple-two" /></div>
      <div className="auth-particle-field" aria-hidden>{Array.from({ length: 22 }, (_, index) => <i key={index} style={{ "--particle-index": index } as CSSProperties} />)}</div>
      {butterflies.map((butterfly) => <i key={butterfly} className={`auth-butterfly auth-butterfly-${butterfly}`} aria-hidden><b /><b /></i>)}
      <div className="auth-scene-copy"><p>ARYAVERSE</p><h1>Seu universo de estudos começa aqui.</h1><span>Água, luz e conhecimento em movimento.</span></div>
    </section>
    <section className="auth-side"><div className="auth-form-surface">{children}</div><i className="auth-butterfly auth-bridge-butterfly" aria-hidden><b /><b /></i></section>
  </main>;
}
