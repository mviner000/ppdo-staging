// app/layout.tsx

import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ThemeProvider } from "../contexts/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import { AccentColorProvider } from "../contexts/AccentColorContext";
import { ProgressBar } from "@/components/providers/ProgressBar";
import { ChangelogBanner } from "@/components/ui/changelog-banner";
import { getLatestChangelog } from "@/data/changelog-data";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PPDO Using Convex + Next.js",
  description:
    "Your trusted source for local news, stories, and community updates in Tarlac",
  icons: {
    icon: "/tarlac_logo.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const latestChangelog = getLatestChangelog();

  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en">
        <body
          className={`${cinzel.variable} ${inter.variable} antialiased`}
        >
          <ConvexClientProvider>
            <ThemeProvider>
              <AccentColorProvider>
                <ProgressBar />
                {/* Changelog Banner - Shows on all pages */}
                <ChangelogBanner
                  version={latestChangelog.version}
                  latestChange={latestChangelog.title}
                  changelogUrl="/changelog"
                  dismissible={true}
                  storageKey={`changelog-${latestChangelog.version}-dismissed`}
                />

                {children}

                <Toaster />
              </AccentColorProvider>
            </ThemeProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}