import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    base: '/xml-validator/',
    server: {
        port: 5173,
    },
});
