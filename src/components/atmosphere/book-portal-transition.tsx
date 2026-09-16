"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/theme/theme-provider";
import { OfficialLogo } from "@/components/brand/official-logo";

/** Portal preparado para a entrada após autenticação. */
export function BookPortalTransition({ onComplete, onSkip }: { onComplete: () => void; onSkip?: () => void }) {
  const { reduceMotion } = useTheme();
  const [visible, setVisible] = useState(true);
  const [sealVisible, setSealVisible] = useState(true);
  useEffect(() => {
    if (reduceMotion) { const timer = window.setTimeout(() => { setVisible(false); onComplete(); }, 50); return () => window.clearTimeout(timer); }
    const sealTimer = window.setTimeout(() => setSealVisible(false), 1150);
    const completeTimer = window.setTimeout(() => { setVisible(false); onComplete(); }, 3550);
    return () => { window.clearTimeout(sealTimer); window.clearTimeout(completeTimer); };
  }, [onComplete, reduceMotion]);
  if (!visible) return null;
  return <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="water-portal-overlay fixed inset-0 z-50 grid place-items-center"><button onClick={onSkip} className="portal-skip" type="button">Pular</button><div className="absolute inset-0 portal-leaves" /><div className="portal-waterfall" />
    {sealVisible ? <motion.div initial={{ opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.04 }} transition={{ duration: .65, ease: "easeOut" }} className="entry-brand-seal"><OfficialLogo priority className="h-auto w-full object-contain" /><span className="entry-brand-particle entry-brand-particle-one" /><span className="entry-brand-particle entry-brand-particle-two" /></motion.div> : <motion.div initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .45, ease: "easeOut" }} className="text-center"><motion.div animate={{ rotateY: [0, -9, 0], scale: [1, 1.04, 1] }} transition={{ duration: 2.2, ease: "easeInOut" }} className="portal-book water-portal-book mx-auto h-52 w-72 rounded-r-lg rounded-l-sm"><span className="portal-pages" /><OfficialLogo className="portal-book-crest h-auto w-44 object-contain" /></motion.div><p className="mt-7 font-serif text-lg text-[var(--surface-strong)]">A cachoeira se abre para você…</p></motion.div>}
  </motion.div>;
}
