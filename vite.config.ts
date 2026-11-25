import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({command}) => {
  return {
    base: './',
    define: {
      __SILLUX_OWNER_DEV__: JSON.stringify(command === 'serve'),
    },
    build: {
      target: 'es2020',
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: path.resolve(__dirname, 'app.src.html'),
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      // Outputs static bundle to dist/, repo root (index.html + assets/), and docs/
      // so browsers and GitHub Pages work directly from / (root), /docs, or Actions.
      {
        name: 'github-pages-static-sync',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) return;
          const distDir = path.resolve(__dirname, 'dist');
          const builtAppHtml = path.join(distDir, 'app.src.html');
          const distIndexHtml = path.join(distDir, 'index.html');
          if (fs.existsSync(builtAppHtml)) {
            fs.renameSync(builtAppHtml, distIndexHtml);
          }

          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }

          const distNotFoundHtml = path.join(distDir, '404.html');
          if (fs.existsSync(distIndexHtml)) {
            fs.copyFileSync(distIndexHtml, distNotFoundHtml);
          }

          if (fs.existsSync(distDir)) {
            fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
            if (!process.env.CI && !process.env.GITHUB_ACTIONS) {
              const rootAssetsDir = path.resolve(__dirname, 'assets');
              const distBundleAssetsDir = path.join(distDir, 'assets');
              if (fs.existsSync(distBundleAssetsDir)) {
                fs.rmSync(rootAssetsDir, {recursive: true, force: true});
                fs.cpSync(distBundleAssetsDir, rootAssetsDir, {recursive: true, force: true});
              }
              if (fs.existsSync(distIndexHtml)) {
                fs.copyFileSync(distIndexHtml, path.resolve(__dirname, 'index.html'));
                fs.copyFileSync(distIndexHtml, path.resolve(__dirname, '404.html'));
              }
              fs.writeFileSync(path.resolve(__dirname, '.nojekyll'), '');

              const docsDir = path.resolve(__dirname, 'docs');
              fs.rmSync(docsDir, {recursive: true, force: true});
              fs.cpSync(distDir, docsDir, {recursive: true, force: true});
            }
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
