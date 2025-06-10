import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		{
			name: 'chrome-devtools-config',
			configureServer(server) {
				server.middlewares.use((req, res, next) => {
					if (req.url === '/.well-known/appspecific/com.chrome.devtools.json') {
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify({
							projectRoot: process.cwd(),
							projectName: 'MathChat'
						}));
						return;
					}
					next();
				});
			}
		}
	],
	server: {
		proxy: process.env.NODE_ENV === 'development' ? {
			'/py-api': {
				target: 'http://localhost:8080',
				changeOrigin: true,
				secure: false
			}
		} : undefined
	}
});
