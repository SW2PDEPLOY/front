import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno según el modo
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react(), tailwindcss()],
    assetsInclude: ['**/*.xml'],
    
    // Definir reemplazos en tiempo de construcción
    define: {
      // Asegurarnos de que las variables de entorno estén disponibles
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'http://localhost:3000'),
    },
    
    // Configuración del servidor de desarrollo
    server: {
      port: 5173,
      strictPort: true,
      host: true, // Permitir acceso desde LAN
    },
    
    // Configuración de la compilación para producción
    build: {
      outDir: 'dist',
      sourcemap: false, // Cambiar a true si necesitas depurar en producción
    }
  }
})
