import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { themeBootScript } from "@sigmafy/ui";
import "@sigmafy/ui/styles.css";
import "./globals.css";

export const metadata = {
  title: "Sigmafy — Six Sigma projects, training, and AI evaluation",
  description:
    "Sigmafy is the Six Sigma platform for running quality projects, training people, and proving the impact — built by 2KO.",
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
