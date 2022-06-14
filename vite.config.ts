import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { undestructurePlugin } from 'babel-plugin-solid-undestructure';

export default defineConfig({
  plugins: [...undestructurePlugin('ts'), solidPlugin()],
  base: '/solid-todo-app-ts/',
  publicDir: './public',
  test: {
    environment: 'jsdom',
    globals: true,
    transformMode: {
      web: [/\.[jt]sx?$/],
    },
    setupFiles: './vitest.setup.ts',
    // solid needs to be inline to work around
    // a resolution issue in vitest:
    deps: {
      inline: [/solid-js/],
    },
    // if you have few tests, try commenting one
    // or both out to improve performance:
    // threads: false,
    // isolate: false,
    include: ['src/**/*.test.{tsx,ts}'],
  },
  build: {
    target: 'esnext',
    polyfillDynamicImport: false,
  },
  resolve: {
    conditions: ['development', 'browser'],
  },
});
