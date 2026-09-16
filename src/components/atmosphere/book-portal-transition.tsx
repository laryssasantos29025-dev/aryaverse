"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTheme } from "@/components/theme/theme-provider";

/** Portal preparado para a entrada após autenticação. */
export function BookPortalTransition({ onComplete, onSkip }: { onComplete: () => void; onSkip?: () => void }) {
  const { reduceMotion } = useTheme();
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (reduceMotion) { const timer = window.setTimeout(() => { setVisible(false); onComplete(); }, 50); return () => window.clearTimeout(timer); }
    const completeTimer = window.setTimeout(() => { setVisible(false); onComplete(); }, 2850);
    return () => window.clearTimeout(completeTimer);
  }, [onComplete, reduceMotion]);
  if (!visible) return null;
  return <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="entry-book-overlay fixed inset-0 z-50 grid place-items-center"><button onClick={onSkip} className="portal-skip" type="button">Pular</button><motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: .55, duration: 1.35, ease: [0.22, 1, 0.36, 1] }} className="entry-white-wash" /><motion.div initial={{ opacity: 0, y: 18, scale: .94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: .3, duration: 1.15, ease: [0.22, 1, 0.36, 1] }} className="entry-book-stage"><motion.div animate={{ y: [0, -5, 0], rotate: [-1, 1, -1] }} transition={{ delay: 1.15, duration: 1.7, ease: "easeInOut" }}><Image src="/illustrations/hero-golden-open-book.png" alt="" width={540} height={360} priority className="entry-book-image" /></motion.div><motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.05, duration: .8 }} className="entry-book-caption">Abra espaço para o que vem a seguir.</motion.p></motion.div></motion.div>;
}
