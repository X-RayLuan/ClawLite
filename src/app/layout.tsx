import type { Metadata } from "next";
import { Source_Serif_4, Inter } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/components/lang-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const displayFont = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL('https://clawlite.ai'),
  title: "OpenClaw Setup Wizard",
  description: "Install OpenClaw in minutes with a friendly, guided wizard.",
  icons: {
    icon: "/icon.svg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        <LangProvider>
          <div className="min-h-screen">
            <SiteHeader />
            {children}
            <SiteFooter />
          </div>
        </LangProvider>
      </body>
    </html>
  );
}
