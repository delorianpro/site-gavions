import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { siteUrl } from "@/lib/site-config";
import "./globals.css";

const inter = localFont({
  src: "../public/assets/fonts/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  weight: "100 900",
  style: "normal",
  display: "swap",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  verification: {
    google: [
      "vkycw8JDqnlJQ-a3siziU70JQUAAWcjPgcT9-rhzgrA",
      "HY43cJzTIZ52sTMtA9UuiaJHtEKQhkxJXLv5gr9GXNw",
    ],
  },
  icons: {
    icon: [
      { url: "/assets/img/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/img/favicon-64.png", sizes: "64x64", type: "image/png" },
    ],
    apple: {
      url: "/assets/img/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#090c0a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        {children}
      </body>
    </html>
  );
}
