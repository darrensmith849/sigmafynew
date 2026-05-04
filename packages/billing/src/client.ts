import { createPaystackAdapter } from "./adapters/paystack";
import type { BillingProvider } from "./provider";
import type { BillingProviderId } from "./types";

export interface BillingClientEnv {
  BILLING_PROVIDER?: BillingProviderId;
  PAYSTACK_SECRET_KEY?: string;
  PAYSTACK_PUBLIC_KEY?: string;
}

export function createBillingClient(env: BillingClientEnv): BillingProvider {
  const provider = env.BILLING_PROVIDER ?? "paystack";
  switch (provider) {
    case "paystack":
      return createPaystackAdapter({
        secretKey: env.PAYSTACK_SECRET_KEY ?? "",
        publicKey: env.PAYSTACK_PUBLIC_KEY ?? "",
      });
    default: {
      const _exhaustive: never = provider;
      throw new Error(`unknown billing provider: ${String(_exhaustive)}`);
    }
  }
}
