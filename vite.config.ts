import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

const ReactCompilerConfig = {
  target: '18',
};

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    glsl(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]],
      },
    }),
  ],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  resolve: {
    alias: {
      // @ts-expect-error __dirname is a nodejs global
      '~': path.resolve(__dirname, './src'),
    },
  },
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**'],
    },
  },
}));
