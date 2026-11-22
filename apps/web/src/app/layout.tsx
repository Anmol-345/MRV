import type { Metadata } from 'next';
import './globals.css';
import { Fraunces, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { ChainProviders } from '@/components/providers/chain-providers';
import { I18nProvider } from '@/lib/i18n';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ShieldAlert } from 'lucide-react';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BluToken – India Blue Carbon Registry & MRV',
  description:
    'Blockchain-based Blue Carbon Registry and MRV Platform for India coastal ecosystems (Sundarbans, Pichavaram, Gulf of Mannar)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-surface text-on-surface font-body antialiased">
        <I18nProvider>
          {/* Mandatory Pilot Registry Notice Banner */}
          <div className="bg-rhizome-earth-container/60 border-b border-rhizome-earth/20 px-4 py-2 text-xs md:text-sm text-on-rhizome-earth-container flex items-center justify-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rhizome-earth shrink-0" />
            <span>
              <strong>Pilot Registry Notice:</strong> BluTokens are pilot registry tokens, not government-certified credits.
            </span>
          </div>

          <ChainProviders>
            <Header />
            <div className="flex-1 flex flex-col">{children}</div>
            <Footer />
          </ChainProviders>
        </I18nProvider>
      </body>
    </html>
  );
}
