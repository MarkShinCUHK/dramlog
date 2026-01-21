import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    // 같은 네트워크(휴대폰 등)에서 IP로 접속 가능하게
    host: true,
    port: 5173,
    strictPort: true
  }
});
