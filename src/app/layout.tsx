import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/components/lang-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
});

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "ClawLite Web Wizard",
  description: "Install OpenClaw in minutes with a friendly, guided wizard."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        <LangProvider>
          <div className="min-h-screen bg-white">
            <SiteHeader />
            {children}
            <SiteFooter />
          </div>
        </LangProvider>
      </body>
    </html>
  );
}
