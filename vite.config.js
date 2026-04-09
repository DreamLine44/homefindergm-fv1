import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Enable chunking for better caching and smaller initial bundle
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk: rarely changes, gets long-lived cache
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Admin chunk: only loaded by admin users
          'chunk-admin': [
            './src/pages/admin/AdminDashboard',
            './src/pages/admin/AdminPostsPage',
            './src/pages/admin/AdminUsersPage',
            './src/pages/admin/AdminCommentsPage',
            './src/pages/admin/ReportsPage',
            './src/pages/admin/ReportDetails',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 700,
    // Minify aggressively in production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
    },
    // Generate sourcemaps for production debugging (optional — remove to save bandwidth)
    sourcemap: false,
  },
  // Faster dev server with dependency pre-bundling
  server: {
    hmr: true,
  },
  // Pre-bundle heavy deps so first load is fast
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
  },
})
