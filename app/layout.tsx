import type { Metadata } from "next";
import { Manrope, Inter, Cormorant_Garamond, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import ScrollToTop from "@/components/layout/ScrollToTop";

// Inter, Manrope і Cormorant — змінні шрифти: один файл на всі товщини
// замість окремого файлу на кожну, тож сторінка вантажить менше.
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
});

// Заголовки по всьому сайту набрані антиквою, технічні підписи — моношрифтом,
// суцільний текст — Inter. Manrope лишився на дрібних елементах інтерфейсу.
const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  variable: "--font-cormorant-garamond",
});

const plexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Природничо-науковий ліцей №145.",
  description: "Офіційний вебсайт Природничо-наукового ліцею №145.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uk"
      className={`${manrope.variable} ${inter.variable} ${cormorant.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        {children}
        <ScrollToTop />
      </body>
    </html>
  );
}