"use client";

import { useEffect } from "react";
import { mountAnimations } from "@sigmafy/ui";

/**
 * Mounts the Sigmafy marketing animation system once for the prototype.
 * `mountAnimations` is no-op on the server and respects
 * `prefers-reduced-motion`. Handles `data-reveal` + `data-magnetic`.
 */
export function RevealMounter() {
  useEffect(() => {
    mountAnimations();
  }, []);
  return null;
}
