import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react(),
    svgr({
      // 설정을 최소화하여 작동 확인
      include: "**/*.svg?react",
    }),
  ],
});
