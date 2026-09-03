import { copyFile, mkdir, writeFile } from 'node:fs/promises';
const output = new URL('../dist-demo/', import.meta.url);
// Real HTML entry points make direct links and refresh work on GitHub Pages.
for (const route of ['produktai', 'paslaugos', 'musu-meistrai', 'apie-mus', 'kontaktai', 'admin']) {
  const directory = new URL(`${route}/`, output);
  await mkdir(directory, { recursive: true });
  await copyFile(new URL('index.html', output), new URL('index.html', directory));
}
await copyFile(new URL('index.html', output), new URL('404.html', output));
await writeFile(new URL('.nojekyll', output), '');
await writeFile(new URL('robots.txt', output), 'User-agent: *\nDisallow: /\n');
