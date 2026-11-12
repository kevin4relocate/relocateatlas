import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://relocateworks.com',
  integrations: [sitemap({ filter: (page) => !new URL(page).pathname.startsWith('/admin/') })],
  output: 'static'
});
