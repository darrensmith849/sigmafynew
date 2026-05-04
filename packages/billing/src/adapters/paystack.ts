import type { BillingProvider } from "../provider";

const PHASE_MINUS_ONE = "billing not implemented in Phase -1 — see docs/phase-log.md";

export interface PaystackAdapterOptions {
  secretKey: string;
  publicKey: string;
}

export function createPaystackAdapter(_opts: PaystackAdapterOptions): BillingProvider {
  return {
    createCustomer: async () => {
      throw new Error(PHASE_MINUS_ONE);
    },
    createCheckout: async () => {
      throw new Error(PHASE_MINUS_ONE);
    },
    getSubscription: async () => {
      throw new Error(PHASE_MINUS_ONE);
    },
    cancelSubscription: async () => {
      throw new Error(PHASE_MINUS_ONE);
    },
    listInvoices: async () => {
      throw new Error(PHASE_MINUS_ONE);
    },
    handleWebhook: async () => {
      throw new Error(PHASE_MINUS_ONE);
    },
  };
}
