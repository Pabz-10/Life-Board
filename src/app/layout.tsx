import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Life Board | Your Personal Dashboard",
  description: "Track your reading, fitness, and life progress with style.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body
        className={`${fraunces.variable} ${plusJakartaSans.variable} ${dmMono.variable} font-body antialiased`}
      >
        <div className="noise-texture" />
        {children}
      </body>
    </html>
  );
}
