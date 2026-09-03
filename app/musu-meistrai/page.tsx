import type { Metadata } from 'next';
import { InformationPage } from '@/components/store/information-page';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Mūsų meistrai · Grožio namai Sfinksas',
};

export default function TeamPage() {
  return <InformationPage view="team" />;
}
