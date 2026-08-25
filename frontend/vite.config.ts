import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  base: '/education/app/',
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'redirect-to-base',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const [pathname, search = ''] = (req.url ?? '').split('?');
          const qs = search ? `?${search}` : '';
          // Ссылки с сайта КФБ часто без trailing slash → Vite base иначе 404
          if (pathname === '/' || pathname === '' || pathname === '/education/app') {
            res.statusCode = 302;
            res.setHeader('Location', `/education/app/${qs}`);
            res.end();
            return;
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
});
