import { getImageProps } from "next/image";
import { BlackFridayCountdown } from "./BlackFridayCountdown";
import styles from "./BlackFridayCampaign.module.css";

const { props: artworkProps } = getImageProps({
  src: "/assets/img/black-friday-ribbon-badge.png",
  width: 1017,
  height: 1546,
  alt: "Black Friday: 40% OFF",
  unoptimized: true,
});

function CampaignOffer() {
  return (
    <div className={styles.offer}>
      <span className={styles.name}>BLACK FRIDAY</span>
      <strong className={styles.discount}>40% OFF</strong>
    </div>
  );
}

export function BlackFridayCampaign({ variant }: { variant: "desktop" | "mobile" }) {
  return (
    <aside
      className={variant === "desktop" ? styles.desktop : styles.mobile}
      aria-label="Campanha Black Friday"
      data-black-friday={variant}
    >
      {variant === "desktop" ? (
        <>
          <picture>
            <source
              media="(1100px <= width < 1492px)"
              srcSet="/assets/img/ribbon-black-friday-ofc.png"
              width={1254}
              height={1254}
            />
            <img {...artworkProps} className={styles.artwork} alt={artworkProps.alt} />
          </picture>
          <BlackFridayCountdown />
        </>
      ) : (
        <div className={styles.banner}>
          <CampaignOffer />
          <BlackFridayCountdown />
        </div>
      )}
    </aside>
  );
}
