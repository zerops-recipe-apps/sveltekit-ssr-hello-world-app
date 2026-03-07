import type { RequestHandler } from '@sveltejs/kit';
import { pool } from '$lib/db.server';
import { readFileSync } from 'fs';
import { join } from 'path';

// Read SvelteKit version once at module init - node_modules is
// deployed alongside build/ so this path is valid at runtime.
let sveltekitVersion = 'unknown';
try {
	const pkg = JSON.parse(
		readFileSync(join(process.cwd(), 'node_modules/@sveltejs/kit/package.json'), 'utf-8')
	);
	sveltekitVersion = pkg.version;
} catch {
	// fallback: version stays 'unknown'
}

// Build time is a constant baked into the bundle by vite.config.ts define.
const buildTime = __BUILD_TIME__;

function renderPage(greeting: string, dbStatus: string, env: string, httpStatus: number): Response {
	const dbOk = dbStatus === 'connected';

	const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SvelteKit · Zerops</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0d0d12;
      color: #c9d1d9;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      padding: 2.5rem 2.5rem 2rem;
      width: 100%;
      max-width: 520px;
    }
    .logos {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 2rem;
    }
    .logo-sep {
      color: #484f58;
      font-size: 20px;
      font-weight: 300;
      line-height: 1;
    }
    .heading {
      font-size: 1.65rem;
      font-weight: 700;
      color: #f0f6fc;
      margin-bottom: 0.4rem;
      line-height: 1.2;
    }
    .subtitle {
      font-size: 0.875rem;
      color: #8b949e;
      margin-bottom: 2rem;
    }
    .divider {
      border: none;
      border-top: 1px solid #21262d;
      margin-bottom: 1.25rem;
    }
    .row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.55rem 0;
      border-bottom: 1px solid #21262d;
    }
    .row:last-child { border-bottom: none; }
    .label {
      font-size: 0.8125rem;
      color: #8b949e;
    }
    .value {
      font-size: 0.8125rem;
      font-weight: 500;
      color: #c9d1d9;
      text-align: right;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .badge-ok {
      background: rgba(35, 134, 54, 0.2);
      color: #3fb950;
      border: 1px solid rgba(63, 185, 80, 0.3);
    }
    .badge-err {
      background: rgba(248, 81, 73, 0.15);
      color: #f85149;
      border: 1px solid rgba(248, 81, 73, 0.3);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logos">
      <!-- SvelteKit logo -->
      <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="42" height="42" rx="8" fill="#FF3E00"/>
        <path d="M32.2 12.3c-1.7-2.5-5.2-3.4-7.8-1.8L14.8 16c-1.3.8-2.2 2-2.4 3.5-.2 1.1.1 2.3.7 3.3-.5.6-.8 1.4-.9 2.1-.2 1.6.5 3.2 1.9 4.1 1.4.9 3.2 1.1 4.8.6.6.9 1.5 1.5 2.6 1.6 1.2.1 2.4-.4 3.2-1.3.9-.6 1.6-1.5 1.9-2.5.2-1.1-.1-2.3-.7-3.3.5-.6.8-1.4.9-2.1.2-1.6-.5-3.2-1.9-4.1z" fill="white" opacity="0.9"/>
        <path d="M18.5 29.1c-1.1.3-2.3-.1-3-.9 0 0 0-.1.1-.1.4-.3.9-.5 1.3-.6h.1c.1.2.3.3.5.5.6.3 1.3.3 1.8 0 .2-.1.3-.2.4-.3h.1c.5.1 1 .3 1.4.5 0 0 0 .1-.1.1-.5.5-1.1.8-1.8 1-.3 0-.6.0-.8-.2zm4.6-3.6c-.2-.6-.7-1.1-1.4-1.2.5-.1.9-.4 1.2-.7.7-1 .4-2.3-.6-3l-.2-.2h-1.4c-.1 0 0 .1 0 .1l.1.1c.3.2.5.4.6.6.2.3.2.7.1 1.1-.1.4-.4.6-.7.8L17 25.3c-.9.5-1.2 1.7-.7 2.6 0 0 0 .1.1.1.4.2.8.3 1.2.4-.1 0-.1 0-.2.1-.5.1-.9.4-1.2.7-.7 1-.4 2.3.6 3l.1.1.1.1h1.3c.1 0 0-.1 0-.1l-.1-.1c-.3-.2-.5-.4-.6-.6-.2-.3-.2-.7-.1-1.1.1-.4.4-.6.7-.8l3.2-1.8c.9-.6 1.2-1.7.6-2.6z" fill="white"/>
      </svg>
      <span class="logo-sep">+</span>
      <!-- Zerops logo -->
      <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="42" height="42" rx="8" fill="#FF6B2C"/>
        <path d="M12 13h18v3.5L18.5 26H30v3H12v-3.5L23.5 16H12V13z" fill="white"/>
      </svg>
    </div>

    <h1 class="heading">${escHtml(greeting)}</h1>
    <p class="subtitle">SvelteKit ${sveltekitVersion} running on Zerops SSR – Node.js at runtime.</p>

    <hr class="divider">

    <div class="row">
      <span class="label">Framework</span>
      <span class="value">SvelteKit ${sveltekitVersion}</span>
    </div>
    <div class="row">
      <span class="label">Environment</span>
      <span class="value">${escHtml(env)}</span>
    </div>
    <div class="row">
      <span class="label">Build time</span>
      <span class="value">${escHtml(buildTime)}</span>
    </div>
    <div class="row">
      <span class="label">Database</span>
      <span class="value">
        <span class="badge ${dbOk ? 'badge-ok' : 'badge-err'}">
          ${dbOk ? '●' : '✕'} ${escHtml(dbStatus)}
        </span>
      </span>
    </div>
  </div>
</body>
</html>`;

	return new Response(html, {
		status: httpStatus,
		headers: { 'content-type': 'text/html; charset=utf-8' }
	});
}

function escHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export const GET: RequestHandler = async () => {
	const env = process.env.NODE_ENV ?? 'production';

	let dbStatus = 'connected';
	let greeting = 'Hello from Zerops!';
	let httpStatus = 200;

	try {
		const result = await pool.query('SELECT message FROM greetings LIMIT 1');
		if (result.rows.length > 0) {
			greeting = result.rows[0].message as string;
		}
	} catch (err) {
		const error = err as Error;
		dbStatus = `ERROR: ${error.message}`;
		httpStatus = 503;
	}

	return renderPage(greeting, dbStatus, env, httpStatus);
};
