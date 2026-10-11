import type { Metadata } from "next";
import { Inter, Reem_Kufi, Noto_Sans_Malayalam } from "next/font/google";
import { nexaFont } from "./fonts";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const reemKufi = Reem_Kufi({
  variable: "--font-reem-kufi",
  subsets: ["latin"],
});

const notoMalayalam = Noto_Sans_Malayalam({
  variable: "--font-noto-malayalam",
  subsets: ["malayalam"],
});

export const metadata: Metadata = {
  title: "DAR EL HASAINARIYYA",
  description: "A private, multi-family Qur'an Khatm tracker by DAR EL HASAINARIYYA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${reemKufi.variable} ${notoMalayalam.variable} ${nexaFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  );
}
