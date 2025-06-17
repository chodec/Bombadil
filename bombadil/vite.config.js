import path from "path"
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  // Load every REACT_APP .env const
  const processEnv = {}
  Object.keys(env).forEach(key => {
    if (key.startsWith('REACT_APP_')) {
      processEnv[`process.env.${key}`] = JSON.stringify(env[key])
    }
  })
  
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": path.resolve("./src"),
      },
    },
    define: processEnv  // Všechny REACT_APP_ proměnné
  }
})