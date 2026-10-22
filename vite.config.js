import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { createMentorApiMiddleware } from "./server/mentorApiServer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function mentorApiPlugin() {
  return {
    name: "mentor-api-plugin",
    configureServer(server) {
      server.middlewares.use(createMentorApiMiddleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(createMentorApiMiddleware());
    },
  };
}

export default defineConfig({
  plugins: [react(), mentorApiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
