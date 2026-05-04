import type { Checkout, Customer, Invoice, Subscription, WebhookEvent } from "./types";

export interface BillingProvider {
  createCustomer(input: { email: string; workspaceId: string }): Promise<Customer>;
  createCheckout(input: {
    customerId: string;
    planId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<Checkout>;
  getSubscription(subscriptionId: string): Promise<Subscription>;
  cancelSubscription(subscriptionId: string): Promise<Subscription>;
  listInvoices(customerId: string): Promise<Invoice[]>;
  handleWebhook(input: { signature: string; rawBody: string }): Promise<WebhookEvent>;
}
