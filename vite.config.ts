import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.BASE_PATH || (process.env.GITHUB_PAGES === 'true' ? '/web-canvas/' : '/'),
});
