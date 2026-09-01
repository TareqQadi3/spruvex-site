import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://spruvex.com"),
  title: {
    default: "SpruVex R — نظام إدارة المطاعم ونقاط البيع",
    template: "%s | SpruVex R",
  },
  description:
    "نظام تشغيل متكامل لمطعمك: نقطة بيع، منيو رقمي بـ QR، شاشة مطبخ لحظية، فوترة متوافقة مع ZATCA، وتقارير ذكية — في منصة واحدة عربية أولاً.",
  icons: { icon: "/icon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable}`}>
      <body className="min-h-screen bg-[var(--color-bg)] font-sans text-[var(--color-ink)] antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
