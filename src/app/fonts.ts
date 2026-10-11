import localFont from "next/font/local";

export const nexaFont = localFont({
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
