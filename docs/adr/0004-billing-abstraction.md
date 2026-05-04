# ADR 0004 — Billing provider abstraction (Paystack-first)

**Status**: Accepted
**Date**: 2026-05-04

## Context

V1 ships in South Africa where Paystack is the dominant payment processor.
Stripe Connect (and Stripe Identity for KYC) is the eventual marketplace
foundation but its availability and operational fit in ZA is uncertain. The
brief tells us to make billing provider-agnostic from day one and to support a
"comped/internal workspace" flag for 2KO/SSA dogfooding.

## Decision

- A `BillingProvider` interface in `packages/billing/src/provider.ts` defines
  the surface that apps depend on (`createCustomer`, `createCheckout`,
  `getSubscription`, `cancelSubscription`, `listInvoices`, `handleWebhook`).
- `createBillingClient(env)` chooses an adapter based on `env.BILLING_PROVIDER`,
  defaulting to `paystack`.
- Apps import `createBillingClient` only — never the adapter, never the
  Paystack SDK, never `stripe`.
- Currency, plan, subscription, and invoice shapes are defined in
  `packages/billing/src/types.ts` — provider-agnostic, expressed in minor
  units to avoid float drift.

## Alternatives considered

- **Hardcode Paystack now and refactor later** — refactoring all billing call
  sites under deadline pressure is exactly the trap the abstraction prevents.
- **Use a billing-as-a-service vendor (Lago, Stripe Billing only)** — adds a
  vendor dependency and doesn't help with ZA-specific Paystack flows.

## Consequences

- Adding Stripe later (when the marketplace is the focus) is one new adapter,
  not a code-base sweep.
- The `BillingProvider` interface needs to be a least-common-denominator. We
  must not let Paystack-specific concepts (e.g. `transaction.reference`)
  leak into the interface.
- Webhook handling must accept a raw body + signature. Each adapter verifies
  according to its provider's scheme.
- "Comped/internal workspace" is implemented in app/billing logic, not as a
  provider feature — it routes around `createCheckout` for those workspaces.
