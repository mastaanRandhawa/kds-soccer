/** Resolve app-internal paths for static hosting with a non-root base (e.g. GitHub Pages /repo/). */
export function resolvePublicPath(href: string): string {
  if (!href || href.startsWith('#') || /^https?:\/\//i.test(href)) return href
  const base = import.meta.env.BASE_URL
  if (href === '/') return base
  const path = href.startsWith('/') ? href.slice(1) : href
  return `${base}${path}`
}
