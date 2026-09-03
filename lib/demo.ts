// Defined only by the standalone GitHub Pages build. The Sites build is unchanged.
declare const __SFINKSAS_DEMO__: boolean;
export const isDemo = typeof __SFINKSAS_DEMO__ !== 'undefined' && __SFINKSAS_DEMO__;

export function sitePath(path: string) {
  if (!isDemo || !path.startsWith('/') || path.startsWith('//')) return path;
  const [pathname, hash] = path.split('#');
  const suffix = pathname === '/' || /\.[^/]+$/.test(pathname) || pathname.endsWith('/') ? '' : '/';
  return `/sfinksas-v2${pathname}${suffix}${hash === undefined ? '' : `#${hash}`}`;
}
