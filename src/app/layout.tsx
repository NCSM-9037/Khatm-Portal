import type { Metadata } from "next";
import { Inter, Reem_Kufi, Noto_Sans_Malayalam } from "next/font/google";
import localFont from "next/font/local";
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

const nexa = localFont({
  src: [
    {
      path: "../../public/fonts/Nexa-Light.woff",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Nexa-Bold.woff",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-nexa",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Darul Hasainariyya",
  description: "A private, multi-family Qur'an Khatm tracker by Darul Hasainariyya.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${reemKufi.variable} ${notoMalayalam.variable} ${nexa.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  );
}
