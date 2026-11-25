import type { ComponentPropsWithoutRef } from "react";
import type { CtaId } from "@/lib/analytics";
import { TrackedAnchor } from "./TrackedAnchor";
import styles from "./Button.module.css";

type Appearance = {
  "data-track"?: CtaId;
  variant?: "primary" | "ghost" | "whatsapp";
  size?: "small" | "large";
  fullWidth?: boolean;
};
type ButtonProps = Appearance & (
  | ({ as: "a" } & ComponentPropsWithoutRef<"a">)
  | ({ as: "button" } & ComponentPropsWithoutRef<"button">)
);

export function Button({ variant = "primary", size, fullWidth, className, ...props }: ButtonProps) {
  const classes = [styles.btn, styles[variant === "whatsapp" ? "btnWa" : variant === "ghost" ? "btnGhost" : "btnPrimary"], size && styles[size === "small" ? "btnSm" : "btnLg"], fullWidth && styles.btnBlock, className].filter(Boolean).join(" ");
  if (props.as === "a") {
    const { as: Tag, ...anchorProps } = props;
    if (anchorProps["data-track"]) return <TrackedAnchor {...anchorProps} data-track={anchorProps["data-track"]} data-button="" data-variant={variant} className={classes} />;
    return <Tag {...anchorProps} data-button="" data-variant={variant} className={classes} />;
  }
  const { as: Tag, ...buttonProps } = props;
  return <Tag {...buttonProps} data-button="" data-variant={variant} className={classes} />;
}
