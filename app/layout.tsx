import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "../components/Navbar";

export const metadata: Metadata = {
  title: "JLPT N3 Marathon (70 Days) | Persiapan Lengkap Kanji, Kosakata & Tata Bahasa",
  description:
    "Aplikasi intensif 70 hari persiapan ujian JLPT N3 2026 mencakup 336 Kanji, 1100+ Kosakata, dan 100 Pola Tata Bahasa dilengkapi furigana, audio, kuis harian, dan flashcards interaktif.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
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

        <footer className="border-t border-slate-900 bg-slate-950/80 py-8 px-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-400">
                JLPT N3 Marathon • Adaptive Study Prep Engine
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Materi terstruktur dari 3 referensi prep JLPT N3: Kanji, Goi, dan Bunpou dengan terjemahan bahasa Indonesia lengkap.
              </p>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <a href="/" className="hover:text-emerald-400 transition-colors">Roadmap</a>
              <span>•</span>
              <a href="/flashcards" className="hover:text-emerald-400 transition-colors">Flashcards</a>
              <span>•</span>
              <a href="/review" className="hover:text-amber-400 transition-colors">Starred Items</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
