import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || 'https://blogpro.tech';
  const wsUrl = env.VITE_WS_URL || 'wss://blogpro.tech';

  return {
    plugins: [react()],
    css: {
      devSourcemap: true,
      preprocessorOptions: {
        css: {
          charset: false
        }
      },
      modules: {
        generateScopedName: '[name]__[local]___[hash:base64:5]'
      }
    },
    build: {
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith('.css')) {
              return 'assets/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'components': path.resolve(__dirname, './src/styles/blocks')
      },
    },
    server: {
      port: 3000,
      host: true,
      cors: true,
      hmr: {
        overlay: false
      },
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          secure: false
        },
        '/ws': {
          target: wsUrl,
          ws: true
        }
      }
    }
  };
});