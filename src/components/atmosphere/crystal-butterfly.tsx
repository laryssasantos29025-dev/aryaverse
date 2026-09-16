import Image from "next/image";
import type { HTMLAttributes } from "react";

type CrystalButterflyProps = HTMLAttributes<HTMLSpanElement> & {
  size?: "sm" | "md" | "lg";
};

/** Decorative asset shared by the AryaVerse atmosphere. Its original golden colours stay fixed. */
export function CrystalButterfly({ className = "", size = "md", ...props }: CrystalButterflyProps) {
  return (
    <span className={`crystal-butterfly crystal-butterfly-${size} ${className}`} aria-hidden="true" {...props}>
      <span className="crystal-butterfly-aura" />
      <Image src="/illustrations/golden-butterfly.png" alt="" fill sizes="84px" className="crystal-butterfly-art" />
      <i className="crystal-butterfly-spark crystal-butterfly-spark-one" />
      <i className="crystal-butterfly-spark crystal-butterfly-spark-two" />
    </span>
  );
}
