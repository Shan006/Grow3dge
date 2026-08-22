import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Builder Growth Incubator — Certifications',
  description: 'Track your progress, earn badges, and download your certification for the Builder Growth Incubator program.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
