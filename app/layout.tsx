import type { Metadata } from 'next';
import { Cormorant_Garamond } from 'next/font/google';
import { AppProvider } from '@/lib/store';
import EraBackground from '@/components/EraBackground';
import RemyMonologue from '@/components/RemyMonologue';
import EdgePopup from '@/components/EdgePopup';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'La Table du Temps · 时间的餐桌',
  description: '法国菜系历史图谱 · 料理鼠王主题',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" className={`h-full ${cormorant.variable}`}>
      <body className="h-full">
        <AppProvider>
          <EraBackground />
          <RemyMonologue />
          <EdgePopup />
          <main className="relative z-10 h-full">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
