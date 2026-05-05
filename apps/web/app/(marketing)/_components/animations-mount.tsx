"use client";

import { useEffect } from "react";
import { mountAnimations } from "@sigmafy/ui";

/** Tiny client wrapper that boots the marketing-page animation primitives. */
export function AnimationsMount() {
  useEffect(() => {
    mountAnimations();
  }, []);
  return null;
}
