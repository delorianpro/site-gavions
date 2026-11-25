import { Reveal } from "@/components/ui/Reveal";
import styles from "./Primitives.module.css";

type SectionHeadingProps = { eyebrow: string; title: string; description?: string };

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <Reveal className={styles.secHead}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2>{title}</h2>
      {description && <p className={styles.sub} data-description="">{description}</p>}
    </Reveal>
  );
}
