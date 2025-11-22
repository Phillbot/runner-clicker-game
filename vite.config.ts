import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import sassDts from 'vite-plugin-sass-dts';

export default defineConfig({
  plugins: [
    sassDts({
      enabledMode: ['development', 'production'],
      sourceDir: path.resolve(__dirname, 'src'),
      outputDir: path.resolve(__dirname, 'src/__generated__/styles'),
    }),
    react({
      tsDecorators: true,
      useAtYourOwnRisk_mutateSwcOptions: options => {
        const jsc = options.jsc || (options.jsc = {});
        const parser = jsc.parser || {};
        jsc.parser = {
          ...parser,
          syntax: 'typescript',
          tsx: true,
          decorators: true,
        };

        const transform = jsc.transform || {};
        jsc.transform = {
          ...transform,
          legacyDecorator: true,
          decoratorMetadata: true,
          useDefineForClassFields: false,
        };
      },
    }),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@fonts': path.resolve(__dirname, 'src/@fonts'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@app': path.resolve(__dirname, 'src/app'),
      '@localization': path.resolve(__dirname, 'src/i18n'),
      '@types': path.resolve(__dirname, 'src/@types'),
      '@config': path.resolve(__dirname, 'src/config'),
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
  },
  server: {
    port: 9000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  css: {
    preprocessorOptions: {
      scss: {},
    },
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  envPrefix: ['REACT_CLICKER_'],
  esbuild: {
    target: 'es2020',
  },
});
