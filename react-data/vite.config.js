import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Nuevos-est-ndares-en-la-Web/' // Reemplaza "NOMBRE-DEL-REPO" con el nombre de tu repositorio

})
