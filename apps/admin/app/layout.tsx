import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { themeBootScript } from "@sigmafy/ui";
import "@sigmafy/ui/styles.css";
import "./globals.css";

export const metadata = {
  title: "Sigmafy Admin",
  description: "2KO platform admin for Sigmafy.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
