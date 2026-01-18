import react from "@vitejs/plugin-react-swc";
import path from "path";
import { Plugin, defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
	root: "client",
	server: {
		host: "localhost",
		port: 8080,
		fs: {
			allow: [".", "../client", "../shared"],
			deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "../server/**"],
		},
	},
	build: {
		outDir: "../dist/spa",
	},
	plugins: [
		react(),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: ["favicon.ico", "logo.png", "robots.txt"],
			manifest: {
				name: "Fusion Starter - AI Agent Builder",
				short_name: "Fusion Starter",
				description: "Build and deploy AI agents with ease",
				theme_color: "#1e293b",
				background_color: "#0f172a",
				display: "standalone",
				orientation: "portrait",
				scope: "/",
				start_url: "/",
				icons: [
					{
						src: "logo.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "logo.png",
						sizes: "512x512",
						type: "image/png",
					},
				],
			},
			workbox: {
				globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/api\./i,
						handler: "NetworkFirst",
						options: {
							cacheName: "api-cache",
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
							},
						},
					},
				],
			},
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./client"),
			"@shared": path.resolve(__dirname, "./shared"),
		},
	},
}));

function expressPlugin(): Plugin {
	return {
		name: "express-plugin",
		apply: "serve", // Only apply during development (serve mode)
		configureServer(server) {
			const app = createServer();

			// Add Express app as middleware to Vite dev server
			server.middlewares.use(app);
		},
	};
}
