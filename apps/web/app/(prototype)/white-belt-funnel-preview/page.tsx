import type { Metadata } from "next";
import { defaultTab, isTabKey } from "./_data/tabs";
import { PrototypeShell } from "./_components/shell";
import { JourneyTab } from "./_components/journey";
import { CertificateTab } from "./_components/certificate";
import { PortalTab } from "./_components/portal";
import { UpgradeTab } from "./_components/upgrade";
import { ReferralTab } from "./_components/referral";
import { StatsTab } from "./_components/stats";
import { RemarketingTab } from "./_components/remarketing";
import { SalesPortalTab } from "./_components/sales-portal";
import { EmailsTab } from "./_components/emails";
import { AgentTab } from "./_components/agent";
import { EndpointsTab } from "./_components/endpoints";
import { IntegrationTab } from "./_components/integration";

export const metadata: Metadata = {
  title: "White Belt Funnel — Surface-Only Prototype · Sigmafy",
  description:
    "Internal review surface for the Sigmafy White Belt post-completion conversion funnel. Mock data only — not connected to live systems.",
  robots: { index: false, follow: false },
};

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function WhiteBeltFunnelPreviewPage({
  searchParams,
}: {
  searchParams: Promise<RawParams>;
}) {
  const params = await searchParams;
  const rawTab = first(params.tab);
  const activeTab = isTabKey(rawTab) ? rawTab : defaultTab;

  return (
    <PrototypeShell activeTab={activeTab}>
      {activeTab === "journey" && (
        <JourneyTab
          moduleId={first(params.module)}
          lessonId={first(params.lesson)}
        />
      )}
      {activeTab === "certificate" && <CertificateTab />}
      {activeTab === "portal" && <PortalTab />}
      {activeTab === "upgrade" && <UpgradeTab />}
      {activeTab === "referral" && <ReferralTab />}
      {activeTab === "stats" && <StatsTab />}
      {activeTab === "remarketing" && <RemarketingTab />}
      {activeTab === "sales" && <SalesPortalTab leadId={first(params.lead)} />}
      {activeTab === "emails" && <EmailsTab templateId={first(params.template)} />}
      {activeTab === "agent" && <AgentTab replyId={first(params.reply)} />}
      {activeTab === "endpoints" && (
        <EndpointsTab endpointId={first(params.endpoint)} />
      )}
      {activeTab === "integration" && <IntegrationTab />}
    </PrototypeShell>
  );
}
