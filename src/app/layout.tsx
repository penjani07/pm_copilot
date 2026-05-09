import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";

import { GlobalCommandBar } from "@/components/global-command-bar";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "PMO Copilot",
  description:
    "AI-native delivery orchestration for turning meetings into governed execution, delivery signals, and follow-through.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${mono.variable}`}>
      <body>
        {children}
        <GlobalCommandBar />
      </body>
    </html>
  );
}
