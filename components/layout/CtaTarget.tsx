"use client";

import { useCallback, type ReactNode } from "react";
import { useInView } from "@/hooks/useInView";
import { useCtaVisibility, type CtaTargetName } from "./CtaVisibilityProvider";

type CtaTargetProps = {
  target: CtaTargetName;
  as?: "div" | "section";
  id?: string;
  className?: string;
  children: ReactNode;
};

export function CtaTarget({ target, as: Tag = "div", children, ...props }: CtaTargetProps) {
  const { setVisibility } = useCtaVisibility();
  const onChange = useCallback((visible: boolean) => setVisibility(target, visible), [setVisibility, target]);
  const { ref } = useInView<HTMLElement>({
    rootMargin: target === "demo" ? "0px 0px -20% 0px" : "0px",
    initial: target === "hero",
    onChange,
  });
  return <Tag {...props} ref={ref}>{children}</Tag>;
}
