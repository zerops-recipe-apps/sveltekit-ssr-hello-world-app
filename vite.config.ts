import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		// Injected at build time - captured once when the artifact is built
		__BUILD_TIME__: JSON.stringify(new Date().toISOString())
	}
});
