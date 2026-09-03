import type { Metadata } from 'next';
import { InformationPage } from '@/components/store/information-page';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Paslaugos · Grožio namai Sfinksas',
};

export default function ServicesPage() {
  return <InformationPage view="services" />;
}
