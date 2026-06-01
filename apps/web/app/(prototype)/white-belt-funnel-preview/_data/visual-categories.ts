import type { ChipTint } from "@sigmafy/ui";
import type { TabKey } from "./tabs";

/**
 * Visual category mapping — prototype-local. Provides a single source of
 * truth for tint application across all polish work in this pass.
 *
 * Does not change any global token. Does not introduce a new colour. Maps
 * existing per-product tints onto our funnel categories so the prototype
 * reads as a coherent system.
 */

export type TabCategory = "learner" | "intelligence" | "ops";

export const tabCategory: Record<TabKey, TabCategory> = {
  journey: "learner",
  certificate: "learner",
  portal: "learner",
  upgrade: "learner",
  referral: "intelligence",
  stats: "intelligence",
  remarketing: "intelligence",
  sales: "intelligence",
  emails: "ops",
  agent: "ops",
  endpoints: "ops",
  integration: "ops",
};

export const tabCategoryLabel: Record<TabCategory, string> = {
  learner: "Learner",
  intelligence: "Funnel intelligence",
  ops: "Ops & sign-off",
};

export const tabCategoryTint: Record<TabCategory, ChipTint> = {
  learner: "training",
  intelligence: "ai",
  ops: "admin",
};

export type FunnelOutcome =
  | "conversion"
  | "engagement"
  | "intent"
  | "risk"
  | "neutral";

export const outcomeTint: Record<FunnelOutcome, ChipTint | undefined> = {
  conversion: "projects",
  engagement: "training",
  intent: "ai",
  risk: "ai",
  neutral: undefined,
};

export const tabsByCategory: Record<TabCategory, TabKey[]> = {
  learner: ["journey", "certificate", "portal", "upgrade"],
  intelligence: ["referral", "stats", "remarketing", "sales"],
  ops: ["emails", "agent", "endpoints", "integration"],
};
