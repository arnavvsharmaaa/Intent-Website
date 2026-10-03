import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// Production origin. Canonical URLs, Open Graph URLs, JSON-LD and the sitemap
// are all built from this, never from the request host, so dev/preview hosts
// can't leak into the output.
export default defineConfig({
  site: 'https://intentapp.app',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [tailwind(), sitemap()],
});
