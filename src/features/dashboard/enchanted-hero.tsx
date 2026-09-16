"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Clock3, Sparkles } from "lucide-react";
import { NewStudyDialog } from "@/components/forms/new-study-dialog";
import { CrystalButterfly } from "@/components/atmosphere/crystal-butterfly";
import { useAuth } from "@/features/auth/auth-provider";
import styles from "./enchanted-hero.module.css";

export function EnchantedHero() {
  const [open, setOpen] = useState(false);
  const { displayName } = useAuth();
  return <>
    <motion.section initial={{ opacity: 0, filter: "blur(7px)", y: 12 }} animate={{ opacity: 1, filter: "blur(0px)", y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="garden-hero water-hero overflow-hidden px-7 py-9 sm:px-10 sm:py-12 lg:min-h-[475px] lg:px-14 lg:py-16">
      <div className="garden-ray garden-ray-one" /><div className="garden-ray garden-ray-two" /><div className="waterfall-mist" /><div className="crystal-cluster crystal-cluster-left" /><div className="crystal-cluster crystal-cluster-right" />
      <CrystalButterfly className={styles.heroButterflyOne} size="sm" />
      <CrystalButterfly className={styles.heroButterflyTwo} size="sm" />
      <CrystalButterfly className={styles.heroButterflyThree} size="sm" />
      <CrystalButterfly className={styles.heroButterflyFour} size="sm" />
      <CrystalButterfly className={styles.heroButterflyFive} size="sm" />
      <div className="relative z-10 flex h-full max-w-xl flex-col justify-center"><p className="hero-eyebrow mb-5 flex items-center gap-2 text-sm font-medium tracking-wide"><Sparkles size={16} />SEU REFÚGIO DE CONHECIMENTO</p><h1 className="font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-[var(--hero-text)] sm:text-5xl">Bem-vinda ao<br />AryaVerse, {displayName}.</h1><p className="hero-copy mt-6 max-w-md text-base leading-7 sm:text-lg">Um novo capítulo espera por você. Entre com calma, a Arya já cuidou do caminho.</p><button onClick={() => setOpen(true)} className="garden-hero-button water-hero-button mt-7 inline-flex w-fit items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold"><BookOpen size={17} />Abrir novo capítulo <ArrowRight size={16} /></button><p className="hero-subtitle mt-5 flex items-center gap-2 text-sm"><Clock3 size={15} />Seu próximo encontro com o saber começa agora.</p></div>
      <div className={`${styles.scene} garden-portal-scene`} aria-hidden>
        <span className={`${styles.waterOrb} ${styles.waterOrbOne}`} /><span className={`${styles.waterOrb} ${styles.waterOrbTwo}`} /><span className={`${styles.waterRipple} ${styles.waterRippleOne}`} /><span className={`${styles.waterRipple} ${styles.waterRippleTwo}`} />
        <div className={styles.tome}>
          <Image src="/illustrations/hero-golden-open-book.png" alt="" fill sizes="(max-width: 640px) 280px, 420px" className={styles.tomeIllustration} priority />
        </div>
        <span className={`${styles.tomeSpark} ${styles.tomeSparkOne}`} /><span className={`${styles.tomeSpark} ${styles.tomeSparkTwo}`} />
      </div>
    </motion.section>
    {open && <NewStudyDialog onClose={() => setOpen(false)} />}
  </>;
}
