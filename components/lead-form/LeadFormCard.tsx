import { Reveal } from "@/components/ui/Reveal";
import { siteConfig } from "@/lib/site-config";
import type { LeadConfig } from "@/lib/leads/types";
import { LeadForm } from "./LeadForm";
import styles from "./LeadForm.module.css";

export function LeadFormCard({ config = siteConfig.leads }: { config?: LeadConfig }) {
  return <Reveal className={styles.formCard}><LeadForm config={config} /></Reveal>;
}
