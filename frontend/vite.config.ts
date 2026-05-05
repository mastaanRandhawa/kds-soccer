import { defineConfig, loadEnv, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

/** GitHub Pages: deep links serve 404.html; copy SPA shell so client routing works */
function spa404(): Plugin {
  return {
    name: 'spa-404-copy',
    closeBundle() {
      const idx = path.resolve(__dirname, 'dist/index.html')
      const dest = path.resolve(__dirname, 'dist/404.html')
      fs.copyFileSync(idx, dest)
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base =
    env.VITE_BASE_PATH ||
    (mode === 'production' ? '/kds-soccer/' : '/')

  return {
    base,
    plugins: [react(), ...(mode === 'production' ? [spa404()] : [])],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  }
})
