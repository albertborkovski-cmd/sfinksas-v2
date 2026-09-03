import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const server = await createServer({ configFile: 'vite.demo.config.ts', server: { middlewareMode: true } });
try {
  const { isDemo, sitePath, bookingHref } = await server.ssrLoadModule('/../lib/demo.ts');
  assert.equal(isDemo, true);
  assert.equal(sitePath('/'), '/sfinksas-v2/');
  assert.equal(sitePath('/produktai#kategorijos'), '/sfinksas-v2/produktai/#kategorijos');
  assert.equal(sitePath('/sfinksas-logo.png'), '/sfinksas-v2/sfinksas-logo.png');
  assert.equal(sitePath('https://example.com'), 'https://example.com');
  assert.equal(bookingHref('https://www.treatwell.lt/'), undefined);

  const { Storefront } = await server.ssrLoadModule('/../components/store/storefront.tsx');
  const products = JSON.parse(await readFile('demo/products.json', 'utf8'));
  assert.equal(products.length, 143);
  assert(products.every(p => p.status === 'active' && !p.imageKey));
  for (const view of ['home', 'catalog', 'services', 'team', 'about', 'contact']) {
    const html = renderToStaticMarkup(React.createElement(Storefront, { products, view }));
    assert(html.includes('/sfinksas-v2/sfinksas-logo.png'));
    assert(!html.includes('href="/admin"'));
    assert(!html.includes('href="https://www.treatwell.lt'));
    assert(!html.includes('<form'));
    for (const [, path] of html.matchAll(/(?:href|src)="(\/[^\"]*)"/g)) {
      assert(path.startsWith('/sfinksas-v2/'), `Unprefixed URL: ${path}`);
      if (/\.(png|jpg|jpeg|webp)$/.test(path)) await access(`dist-demo/${path.slice('/sfinksas-v2/'.length)}`);
    }
    console.log(`PASS: ${view} renders with demo-safe links and assets`);
  }
  for (const route of ['', 'produktai/', 'paslaugos/', 'musu-meistrai/', 'apie-mus/', 'kontaktai/', 'admin/']) {
    const html = await readFile(`dist-demo/${route}index.html`, 'utf8');
    assert(html.includes('noindex,nofollow'));
    assert(html.includes('/sfinksas-v2/assets/'));
  }
  for (const filename of await readdir('dist-demo/assets')) {
    if (!filename.endsWith('.js')) continue;
    const js = await readFile(`dist-demo/assets/${filename}`, 'utf8');
    assert(!js.includes('/api/orders'), 'Order API must not ship in the demo');
    assert(!js.includes('customerName'), 'Checkout form must not ship in the demo');
  }
  console.log('PASS: direct routes exist; order API and checkout form are removed from the bundle');
} finally {
  await server.close();
}
