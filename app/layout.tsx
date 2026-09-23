import type { Metadata, Viewport } from "next";
import "@fontsource-variable/open-sans"; // brand typeface (kit: Open Sans), variable 300-800
import "@fontsource/jetbrains-mono/400.css"; // terminal layer only
import "@fontsource/jetbrains-mono/700.css";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { EVENT } from "@/lib/config";

export const metadata: Metadata = {
  title: `${EVENT.name} · Renaissance Innovation Labs`,
  description: `${EVENT.tagline} Find the [ ] codes, crack the clues, win comics and merch.`,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#212120",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
