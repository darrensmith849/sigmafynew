/** Provider-agnostic billing shapes. Apps depend on these, never on Paystack. */

export type Currency = "ZAR" | "USD" | "GBP" | "EUR";

export interface Customer {
  id: string;
  email: string;
  workspaceId: string;
}

export interface Plan {
  id: string;
  name: string;
  amountMinor: number;
  currency: Currency;
  interval: "monthly" | "annual";
}

export interface Subscription {
  id: string;
  customerId: string;
  planId: string;
  status: "trialing" | "active" | "past_due" | "canceled";
  currentPeriodEnd: string;
}

export interface Checkout {
  url: string;
  reference: string;
}

export interface Invoice {
  id: string;
  customerId: string;
  amountMinor: number;
  currency: Currency;
  status: "draft" | "open" | "paid" | "void";
  issuedAt: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  receivedAt: string;
  payload: unknown;
}

export type BillingProviderId = "paystack";
