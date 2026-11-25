"use client";

import type { ComponentPropsWithoutRef } from "react";
import { track, type CtaId } from "@/lib/analytics";

/** Only anchors with an explicit commercial CTA identifier need this boundary. */
export function TrackedAnchor({ "data-track": cta, onClick, ...props }: ComponentPropsWithoutRef<"a"> & { "data-track": CtaId }) {
  return <a {...props} data-track={cta} onClick={event => {
    onClick?.(event);
    if (!event.defaultPrevented) track("cta_click", { cta });
  }} />;
}
