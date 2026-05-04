# @sigmafy/billing

Provider-agnostic billing surface. Paystack-first per the brief, but every app
import goes through `createBillingClient(env)` so we can swap or add providers
(Stripe Connect, etc.) without touching app code.

## Phase -1

Signature-only. The Paystack adapter exposes the full `BillingProvider`
interface, but every method throws `"billing not implemented in Phase -1"`.

## Hard rule

Apps import `createBillingClient` only. Never import the adapter directly,
never import `paystack` SDK in app code.
