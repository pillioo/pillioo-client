import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND_URL = 'http://localhost:8000'

// Proxying these paths avoids CORS in local dev: the backend currently only
// allows http://localhost:3000 (see pillioo/backend/app/main.py), not the
// Vite dev server origin. Requests to these paths are forwarded server-side
// instead of going cross-origin from the browser.
const BACKEND_PATHS = [
  '/tickets',
  '/dashboard',
  '/inventory',
  '/reports',
  '/audit',
  '/chat',
  '/approval',
  '/events',
]

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: Object.fromEntries(BACKEND_PATHS.map((path) => [path, BACKEND_URL])),
  },
})
