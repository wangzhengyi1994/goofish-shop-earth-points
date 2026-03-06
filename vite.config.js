import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/goofish-shop-earth-points/',
  plugins: [vue()],
  resolve:{
    alias:{
      "@": path.resolve(__dirname, "src"),
      "~@": path.resolve(__dirname, "src"),
    }
  },
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.fbx', '**/*.hdr'],
})
