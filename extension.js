/* eslint-env node */
/* global logger */

import { execSync } from 'node:child_process';
import { existsSync, openSync, statSync, unlinkSync, writeSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout } from 'node:timers/promises';

import serveStatic from 'serve-static';

function resolveConfig(options) {
	const config = {
		buildCommand: options.buildCommand ?? 'npx astro build',
		port: options.port,
		prebuilt: options.prebuilt ?? false,
		securePort: options.securePort,
	};

	return config;
}

export function start(options = {}) {
	const config = resolveConfig(options);

	return {
		async handleDirectory(_, absolutePath) {
			if (config.prebuilt && !existsSync(join(absolutePath, 'dist'))) {
				throw new Error(`Prebuilt mode is enabled, but the Astro application dist folder does not exist.`);
			}

			if (!config.prebuilt) {
				await build(config, absolutePath);
			}

			await serve(config, absolutePath, options.server);

			return true;
		},
	};
}

async function build(config, componentPath) {
	const startTime = Date.now();
	const buildLockPath = join(tmpdir(), '.harperdb-astro-build.lock');

	while (true) {
		// Lock File Handling
		try {
			const buildLockFD = openSync(buildLockPath, 'wx');
			writeSync(buildLockFD, process.pid.toString());
		} catch (error) {
			if (error.code === 'EEXIST') {
				try {
					if (statSync(buildLockPath).mtimeMx < startTime - 100) {
						unlinkSync(buildLockPath);
					}
				} catch (error) {
					if (error.code === 'ENOENT') {
						continue;
					}

					throw error;
				}

				await setTimeout(1000);
				continue;
			}

			throw error;
		}

		// Build staleness check
		try {
			if (statSync(join(componentPath, 'dist/server/entry.mjs')).mtimeMs > startTime) {
				unlinkSync(buildLockPath);
				break;
			}
		} catch (error) {
			if (error.code !== 'ENOENT') {
				throw error;
			}
		}

		// Build the application
		try {
			const stdout = execSync(config.buildCommand, {
				cwd: componentPath,
				encoding: 'utf-8',
			});

			if (stdout) {
				logger.info(stdout);
			}
		} catch (error) {
			logger.error(error);
		}

		unlinkSync(buildLockPath);
		break;
	}
}

async function serve(config, componentPath, server) {
	const staticHandler = serveStatic(join(componentPath, 'dist/client'));

	server.http(
		(request, next) => {
			return staticHandler(request._nodeRequest, request._nodeResponse, () => {
				return next(request);
			});
		},
		{ port: config.port, securePort: config.securePort, runFirst: true }
	);

	const astroEntry = await import(join(componentPath, 'dist/server/entry.mjs'));
	const astroHandler = astroEntry.handler;

	server.http(
		(request, next) => {
			return astroHandler(request._nodeRequest, request._nodeResponse, () => {
				return next(request);
			});
		},
		{ port: config.port, securePort: config.securePort, runFirst: true }
	);
}
