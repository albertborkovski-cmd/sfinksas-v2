import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://sfinksas-v2.albertborkovski.chatgpt.site'),
  title: 'Sfinksas V2 · Profesionalios plaukų priežiūros parduotuvė',
  description:
    'Profesionalios plaukų priežiūros priemonės, kurias atrenka „Sfinksas“ grožio namų meistrai.',
  openGraph: {
    title: 'Sfinksas V2 · Profesionalios plaukų priežiūros parduotuvė',
    description:
      'Atraskite profesionalias plaukų priežiūros priemones, atrinktas „Sfinksas“ grožio namų meistrų.',
    type: 'website',
    url: '/',
    images: [
      {
        url: '/og.png',
        width: 1731,
        height: 909,
        alt: 'Sfinksas V2 · Profesionali plaukų priežiūra',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sfinksas V2 · Profesionalios plaukų priežiūros parduotuvė',
    description:
      'Atraskite profesionalias plaukų priežiūros priemones, atrinktas „Sfinksas“ grožio namų meistrų.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lt">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
