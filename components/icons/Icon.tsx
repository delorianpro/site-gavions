import type { SVGProps } from "react";
import styles from "./Icon.module.css";

export type IconName =
  | "shield"
  | "shield-off"
  | "bell"
  | "siren"
  | "bulb"
  | "clock"
  | "calendar"
  | "play"
  | "download"
  | "building"
  | "users"
  | "signal"
  | "lock"
  | "server"
  | "eye-off"
  | "video"
  | "check"
  | "x"
  | "chevron"
  | "chevron-r"
  | "back"
  | "map"
  | "zap"
  | "hand"
  | "person"
  | "car"
  | "truck"
  | "bike"
  | "paw"
  | "drive"
  | "activity"
  | "alert"
  | "plus"
  | "home"
  | "grid"
  | "account"
  | "router"
  | "camera"
  | "flag"
  | "arrow"
  | "sparkles"
  | "headset"
  | "hardhat"
  | "warehouse"
  | "store"
  | "layers"
  | "cloud-off"
  | "wrench"
  | "phone"
  | "maximize"
  | "receipt"
  | "wa";

type IconProps = Omit<SVGProps<SVGSVGElement>, "name"> & { name: IconName };

export function Icon({ name, className, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" {...props} data-icon="" className={[styles.icon, className].filter(Boolean).join(" ")}>
      <use href={`#i-${name}`} />
    </svg>
  );
}
