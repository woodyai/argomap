// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['three', '@react-three/fiber', '@react-three/drei'],
    },
    ssr: {
      noExternal: ['three', '@react-three/fiber', '@react-three/drei'],
    },
  }
});
