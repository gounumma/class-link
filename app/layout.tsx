import type { Metadata } from "next";
import { Noto_Sans_KR, Manrope } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DemoBanner } from "@/components/demo-banner";

const noto = Noto_Sans_KR({ subsets: ["latin"], variable: "--font-noto" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: { default: "클래스링크 | 믿을 수 있는 맞춤 과외", template: "%s | 클래스링크" },
  description: "검증된 튜터와 학생을 연결하는 안전한 맞춤 과외 플랫폼"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body className={`${noto.variable} ${manrope.variable} font-[var(--font-noto)]`}><DemoBanner /><SiteHeader /><main className="min-h-[70vh]">{children}</main><SiteFooter /></body></html>;
}
