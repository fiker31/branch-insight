import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' so built asset paths are relative — required for Electron file:// loading
// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
})
