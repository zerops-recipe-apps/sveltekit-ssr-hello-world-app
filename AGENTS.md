# sveltekit-ssr-hello-world-app

SvelteKit 2 SSR starter using `@sveltejs/adapter-node`, PostgreSQL sibling, idempotent migration via `zsc execOnce` — baseline SvelteKit SSR recipe on Zerops.

## Zerops service facts

- HTTP port: `3000`
- Siblings: `db` (PostgreSQL) — env: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`
- Runtime base: `nodejs@24`

## Zerops dev

`setup: dev` idles on `zsc noop --silent`; the agent starts the dev server.

- Dev command: `npm run dev`
- In-container rebuild without deploy: `npm run build`

**All platform operations (start/stop/status/logs of the dev server, deploy, env / scaling / storage / domains) go through the Zerops development workflow via `zcp` MCP tools. Don't shell out to `zcli`.**

## Notes

- Prod build uses `npm ci --include=dev` — Zerops sets `NODE_ENV=production`, which omits devDependencies (Vite, SvelteKit) unless explicitly included.
- `adapter-node` is NOT self-contained — `node_modules/` and `package.json` are deployed alongside `build/` so module resolution works at runtime.
- `migrate.js` is run by `zsc execOnce ${appVersionId}` — exactly one container executes it per deploy, even with `minContainers: 2+`.
- Favicon lives in `static/favicon.ico`.
