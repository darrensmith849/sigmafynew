import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { themeBootScript } from "@sigmafy/ui";
import "@sigmafy/ui/styles.css";
import "./globals.css";

export const metadata = {
  title: "Sigmafy Statistics — 288 Six Sigma tools, one studio",
  description:
    "Plug-and-play Six Sigma & quality statistics — control charts, capability, hypothesis tests, ANOVA, regression, DOE. Runs on validated scipy/statsmodels code, results stored in your workspace.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <head>
        {/* Apply persisted theme before first paint to avoid a flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
