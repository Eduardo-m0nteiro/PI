import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Em desenvolvimento o Vite serve o front (5173) e repassa /api ao Express (3000).
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: { "/api": "http://localhost:3000" },
    },
});
