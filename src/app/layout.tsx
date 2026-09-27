import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeContext';
import { ThemeSwitcherModal } from '@/components/theme/ThemeSwitcherModal';

export const metadata: Metadata = {
  title: 'MAUSAM — Smart Personalized Weather Intelligence',
  description: 'AI-driven personalized weather intelligence for health, fitness, travel, family, agriculture, commuting, and event planning.',
  keywords: ['weather', 'personalized weather', 'mausam', 'air quality', 'fitness weather', 'forecast'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#090d16',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen selection:bg-primary-500/30 selection:text-primary-200">
        <ThemeProvider>
          {children}
          <ThemeSwitcherModal />
        </ThemeProvider>
      </body>
    </html>
  );
}
