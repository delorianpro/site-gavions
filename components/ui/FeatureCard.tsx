import { Reveal } from "@/components/ui/Reveal";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons/Icon";
import styles from "./Primitives.module.css";

type FeatureCardProps = { icon: IconName; title: string; children: ReactNode; warning?: boolean; className?: string; delay?: number };

export function FeatureCard({ icon, title, children, warning, className, delay = 0 }: FeatureCardProps) {
  return (
    <Reveal as="article" delay={delay} className={[styles.card, className].filter(Boolean).join(" ")}>
      <span className={[styles.cic, warning && styles.warn].filter(Boolean).join(" ")}><Icon name={icon} /></span>
      <h3>{title}</h3>
      <p>{children}</p>
    </Reveal>
  );
}
