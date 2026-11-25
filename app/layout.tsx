import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
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
  title: "Gavions | Vigilância inteligente para empresas",
  description:
    "Câmeras com inteligência artificial que reconhecem pessoas e veículos, disparam sirene e refletores e avisam no seu celular, mesmo no silencioso. Gravação no seu local, Central Gavions acompanhando e funcionamento com 4G. Agende uma demonstração.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Gavions",
    title:
      "Gavions | Invasão detectada, sirene tocando e você avisado em segundos",
    description:
      "Vigilância com inteligência artificial para empresas, galpões, lojas e obras. Agende uma demonstração.",
    // A URL da imagem social será definida quando o domínio público for informado.
  },
  twitter: {
    card: "summary_large_image",
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

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Gavions: vigilância inteligente",
  serviceType: "Monitoramento de câmeras com inteligência artificial",
  areaServed: "BR",
  provider: { "@type": "Organization", name: "Gavions" },
  description:
    "Câmeras com IA que reconhecem pessoas e veículos, acionam sirene e refletores e avisam no celular e no WhatsApp, com gravação local e acompanhamento da Central Gavions.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(serviceJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
