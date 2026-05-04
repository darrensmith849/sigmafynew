import type { ReactNode } from "react";
import "@sigmafy/ui/styles.css";
import "./globals.css";

export const metadata = {
  title: "Sigmafy",
  description: "The operating system for Six Sigma and Lean improvement work.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
