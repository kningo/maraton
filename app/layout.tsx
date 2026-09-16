import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export const metadata: Metadata = {
  title: "JLPT N3 Marathon (70 Days) | Persiapan Lengkap Kanji, Kosakata & Tata Bahasa",
  description:
    "Aplikasi intensif 70 hari persiapan ujian JLPT N3 2026 mencakup 336 Kanji, 1100+ Kosakata, dan 100 Pola Tata Bahasa dilengkapi furigana, audio, kuis harian, dan flashcards interaktif.",
  icons: {
    icon: "https://xkningo.my.id/favicon.png",
    shortcut: "https://xkningo.my.id/favicon.png",
    apple: "https://xkningo.my.id/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="https://xkningo.my.id/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="https://xkningo.my.id/favicon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('jlpt_n3_theme');
                  if (theme === 'matcha') {
                    document.documentElement.setAttribute('data-theme', 'matcha');
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
