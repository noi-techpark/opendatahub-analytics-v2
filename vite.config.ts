import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

console.log(process.env.VITE_SERVER_PORT)

// https://vitejs.dev/config/

export default defineConfig(({ command, mode }) => {
   // Load env file based on `mode` in the current working directory.
   // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
   const env = loadEnv(mode, process.cwd(), '')

   return {
      plugins: [vue()],
      server: {
         port: env.VITE_SERVER_PORT ? Number(env.VITE_SERVER_PORT) : 3000,
      },
      resolve: {
         alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
         },
      },
   }
})
