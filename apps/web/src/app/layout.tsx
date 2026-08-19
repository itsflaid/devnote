import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Base URL untuk semua relative URL di metadata (og image, canonical, dll)
  metadataBase: new URL("https://devnote-five.vercel.app"),

  // Template ini yang dipakai semua page lain: "Dashboard | Devnote", "Explore | Devnote", dll
  // Homepage akan override ini lewat metadata di page.tsx
  title: {
    default: "Devnote — Code Note Manager untuk Developer",
    template: "%s | Devnote",
  },

  description:
    "Devnote adalah code note manager untuk developer. Simpan, organisir, dan temukan kembali kode favoritmu dengan cepat.",

  keywords: [
    "code snippet manager",
    "snippet manager online",
    "code note manager",
    "aplikasi catatan developer online",
    "developer note app",
    "simpan kode online",
    "code snippet manager gratis",
    "share code online",
    "share kode",
    "explore code",
    "code snippet manager tim",
    "alternatif github gist",
    "tempat simpan kode sering dipakai",
    "cara organize code snippet rapi",
    "code snippet manager indonesia",
    "code snippet organizer",
    "simpan kode di cloud",
    "snippet sharing",
    "kumpulan code snippet",
    "code library online",
    "pastebin alternatif",
    "manajemen snippet",
    "repo kode pribadi",
    "simpan snippet kode",
    "devnote",
    "developer tools",
  ],

  authors: [{ name: "Fadil" }],
  creator: "Fadil",

  // manifest: "/manifest.ts",

  icons: {
    icon: "/emerald-trans-bg.png",
    apple: "/icon-192.png",
  },

  // OG default — di-override per page kalau perlu
  openGraph: {
    siteName: "Devnote",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Devnote — Code Note Manager untuk Developer",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  verification: {
    google: 'GBAKYaOoWG8RG-vNSPAfDngKaM3j0efT0Mv_dy91CSI',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${outfit.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-[#0a0a0a] text-[#e8f0e8] antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Devnote",
              url: "https://devnote-five.vercel.app",
              description:
                "Devnote adalah code snippet manager untuk developer. Simpan, organisir, dan bagikan kode online.",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://devnote-five.vercel.app/explore?search={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
