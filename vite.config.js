import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
//import fs from 'fs';

// Vite 설정
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // @를 src 디렉토리로 설정
    },
  },
  server: {
    headers: {
      'Content-Security-Policy': "script-src 'self' 'unsafe-inline' https://apis.google.com;",
    },
    port: 3000, // 개발 서버 포트 설정
    open: true, // 개발 서버 실행 시 브라우저 자동 오픈
    // https: {
    //   key: fs.readFileSync('./localhost-key.pem'),
    //   cert: fs.readFileSync('./localhost.pem'),
    // }
  },
});
