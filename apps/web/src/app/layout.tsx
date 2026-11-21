import type { Metadata } from 'next';
import './globals.css';
import { ChainProviders } from '@/components/providers/chain-providers';
import { I18nProvider } from '@/lib/i18n';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: 'BluToken – India Blue Carbon Registry & MRV',
  description:
    'Blockchain-based Blue Carbon Registry and MRV Platform for India coastal ecosystems',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-mist text-ink antialiased">
        <I18nProvider>
          {/* Mandatory Pilot Registry Notice Banner */}
          <div className="bg-earth/15 border-b border-earth/30 px-4 py-2 text-xs md:text-sm text-ink flex items-center justify-center gap-2">
            <ShieldAlert className="w-4 h-4 text-earth shrink-0" />
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
