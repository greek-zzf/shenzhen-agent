import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: () => {
        const body = [
          'User-Agent: *',
          'Allow: /',
          'Allow: /p/',
          'Disallow: /admin',
          'Disallow: /settings',
          'Disallow: /intake',
          'Disallow: /library',
          'Disallow: /run',
          'Disallow: /me',
          'Disallow: /api/',
          'Disallow: /*?*',
          '',
          `Sitemap: ${envConfigs.app_url}/sitemap.xml`,
          '',
        ].join('\n');
        return new Response(body, {
          headers: { 'Content-Type': 'text/plain' },
        });
      },
    },
  },
});
