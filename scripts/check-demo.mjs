import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const server = await createServer({ configFile: 'vite.demo.config.ts', server: { middlewareMode: true } });
try {
  const { isDemo, sitePath } = await server.ssrLoadModule('/../lib/demo.ts');
  assert.equal(isDemo, true);
  assert.equal(sitePath('/'), '/sfinksas-v2/');
  assert.equal(sitePath('/produktai#kategorijos'), '/sfinksas-v2/produktai/#kategorijos');
  assert.equal(sitePath('/sfinksas-logo.png'), '/sfinksas-v2/sfinksas-logo.png');
  assert.equal(sitePath('https://example.com'), 'https://example.com');
  const { AssistantChat } = await server.ssrLoadModule('/../components/store/assistant-chat.tsx');
  const launcher = renderToStaticMarkup(React.createElement(AssistantChat));
  assert(launcher.includes('Atidaryti AI asistento pokalbį'));
  assert(launcher.includes('aria-expanded="false"'));
  assert(launcher.includes('size-12'));
  assert(!launcher.includes('<form'));
  console.log('PASS: small AI chat launcher remains closed initially');
  const { treatwellCalendarUrl, treatwellAppBookingUrl } = await server.ssrLoadModule('/../lib/treatwell.ts');
  const team = JSON.parse(await readFile('lib/team.json', 'utf8'));
  let bookingCount = 0;
  for (const member of team.members) {
    for (const service of member.services) {
      for (const option of service.bookingOptions) {
        const url = new URL(treatwellCalendarUrl(member.id, service.id, option.id));
        assert.equal(url.origin, 'https://www.treatwell.lt');
        assert.equal(url.pathname, '/availability');
        assert.equal(url.searchParams.get('venueId'), '405427');
        assert.deepEqual(JSON.parse(url.searchParams.get('proposedServices')), [
          { menuItemId: service.id, optionIds: [option.id], employeeId: member.id },
        ]);
        assert.deepEqual(JSON.parse(url.searchParams.get('employeeService')), { [service.id]: member.id });
        const appUrl = new URL(treatwellAppBookingUrl(member.id, service.id, option.id));
        assert.equal(appUrl.origin, 'https://treatwell.onelink.me');
        assert.equal(appUrl.pathname, '/32083905');
        assert.equal(appUrl.searchParams.get('deep_link_value'), url.toString());
        assert.equal(appUrl.searchParams.get('af_web_dp'), url.toString());
        assert.equal(appUrl.searchParams.get('af_dp'), url.toString().replace('https://', 'treatwell://'));
        assert.equal(appUrl.searchParams.get('af_force_deeplink'), 'true');
        assert.equal(appUrl.searchParams.get('is_retargeting'), 'true');
        bookingCount++;
      }
    }
  }
  assert(bookingCount > 0);
  console.log(`PASS: ${bookingCount} employee/service links preserve the calendar in Treatwell web and app deep links`);

  const { Storefront } = await server.ssrLoadModule('/../components/store/storefront.tsx');
  const products = JSON.parse(await readFile('demo/products.json', 'utf8'));
  assert.equal(products.length, 143);
  assert(products.every(p => p.status === 'active' && !p.imageKey));
  for (const view of ['home', 'catalog', 'services', 'team', 'about', 'contact']) {
    const html = renderToStaticMarkup(React.createElement(Storefront, { products, view }));
    assert(html.includes('/sfinksas-v2/sfinksas-logo.png'));
    assert(!html.includes('href="/admin"'));
    if (view === 'services') {
      const links = [...html.matchAll(/<a\b[^>]*href="https:\/\/www\.treatwell\.lt[^>]*>/g)];
      assert.equal(links.length, 7, 'All six service cards and the booking button must link to Treatwell');
      for (const [link] of links) {
        assert(link.includes('target="_blank"'));
        assert(link.includes('rel="noopener noreferrer"'));
        assert(!link.includes('aria-disabled="true"'));
      }
    }
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
