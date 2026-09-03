import { createRoot } from 'react-dom/client';
import { Storefront } from '@/components/store/storefront';
import type { Product } from '@/lib/types';
import { sitePath } from '@/lib/demo';
import products from './products.json';
import '@/app/globals.css';
import './style.css';

const views = {
  '': 'home', produktai: 'catalog', paslaugos: 'services',
  'musu-meistrai': 'team', 'apie-mus': 'about', kontaktai: 'contact',
} as const;
const route = window.location.pathname.replace(/^\/sfinksas-v2\/?/, '').replace(/\/$/, '');
const view = views[route as keyof typeof views];
const titles = { home: 'Naujienos', catalog: 'Produktai', services: 'Paslaugos', team: 'Mūsų meistrai', about: 'Apie mus', contact: 'Kontaktai' };
document.title = `${view ? titles[view] : 'Puslapis nepasiekiamas'} · Sfinksas · Demonstracija`;

createRoot(document.getElementById('root')!).render(
  <>
    <aside className="demo-notice" aria-label="Demonstracinė versija">
      <strong>DEMONSTRACIJA</strong> · Produktų užsakymai ir administravimas išjungti. „Treatwell“ nuorodos atidaro tikrą registraciją.
    </aside>
    {view ? <Storefront products={products as Product[]} view={view} /> : (
      <main className="demo-unavailable">
        <h1>{route === 'admin' ? 'Administravimas demonstracijoje išjungtas' : 'Puslapis nerastas'}</h1>
        <p>Galite peržiūrėti produktus, jų aprašymus ir svetainės dizainą.</p>
        <a href={sitePath('/produktai')}>Atidaryti produktus →</a>
      </main>
    )}
  </>,
);
