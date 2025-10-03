import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: "/v1options-dashboard-ui/",
  plugins: [react()],
  resolve: {
    alias: { '@': '/src' },
  },
  define: {
    __EXTENDED_STRATEGIES__: JSON.stringify(true),
  },
  build: { outDir: 'dist', target: 'es2019', sourcemap: false },
});
