import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [dts({
    entryRoot: 'src',
    outDir: 'dist'
  })],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'dsml',
      fileName: 'index',
      formats: ['es']
    }
  }
})
