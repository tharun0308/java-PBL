import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { BuildTimestamp } from '@/components/build-timestamp';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Grivo — Campus Grievance Management System',
  description:
    'Campus facility issue tracking, triage, resolution, and audit trail system for students and administrators.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col antialiased bg-cream text-body`}>
        <Providers>
          {children}
          <BuildTimestamp />
        </Providers>
      </body>
    </html>
  );
}
