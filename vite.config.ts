import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const base = process.env.VITE_GH_BASE || '/';

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: { '@': '/src' },
  },
  define: {
    __EXTENDED_STRATEGIES__: JSON.stringify(true),
  },
  build: { outDir: 'dist', target: 'es2019', sourcemap: false },
});
