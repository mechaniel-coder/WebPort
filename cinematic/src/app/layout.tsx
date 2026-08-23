import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  style: ["normal", "italic"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cinematic — a kit of eight",
  description:
    "Eight full landing pages built from the Cinematic Websites Kit: one shared token system, eight distinct identities.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <div className="grain" aria-hidden="true" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
