import type { Metadata } from 'next';
import { InformationPage } from '@/components/store/information-page';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Kontaktai · Grožio namai Sfinksas',
};

export default function ContactPage() {
  return <InformationPage view="contact" />;
}
