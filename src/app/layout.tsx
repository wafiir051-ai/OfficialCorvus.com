import type { Metadata } from "next";
import { Anton, Inter, JetBrains_Mono, Permanent_Marker } from "next/font/google";
import { BagProvider } from "@/context/BagContext";
import { ReferralProviderWithSuspense } from "@/context/ReferralProviderWithSuspense";
import "./globals.css";

const anton = Anton({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const permanentMarker = Permanent_Marker({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "CORVUS",
  description: "Editorial staples, made to last.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${anton.variable} ${inter.variable} ${jetbrainsMono.variable} ${permanentMarker.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-background text-foreground">
        <ReferralProviderWithSuspense>
          <BagProvider>{children}</BagProvider>
        </ReferralProviderWithSuspense>
      </body>
    </html>
  );
}
